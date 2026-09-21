import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import { supabase } from '../services/supabase';

interface PendingPayment {
  id: string;
  order_id: string;
  amount: number;
  qr_session_id: string;
  created_at: string;
  status: string;
}

export function PendingPaymentsScreen() {
  const [payments, setPayments] = useState<PendingPayment[]>([
    {
      id: 'pay-001',
      order_id: 'ORD-78901',
      amount: 145.5,
      qr_session_id: 'QR-A1B2C3',
      created_at: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: 'pay-002',
      order_id: 'ORD-78902',
      amount: 89.0,
      qr_session_id: 'QR-X9Y8Z7',
      created_at: new Date(Date.now() - 300000).toISOString(),
      status: 'pending',
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen to Realtime updates on payment_verifications
    const subscription = supabase
      .channel('pending-payments-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payment_verifications' },
        (payload) => {
          Vibration.vibrate([0, 250, 100, 250]);
          setPayments((prev) => [payload.new as PendingPayment, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleVerify = async (paymentId: string, orderId: string) => {
    Alert.alert(
      'Confirmar Verificación',
      `¿Deseas validar el pago para la orden ${orderId}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Validar y Aprobar',
          onPress: async () => {
            setLoading(true);
            try {
              // Call edge function or update record
              setPayments((prev) => prev.filter((p) => p.id !== paymentId));
              Alert.alert('Éxito', `Pago para ${orderId} verificado.`);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Error al verificar';
              Alert.alert('Error', msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pagos Pendientes QR</Text>
        <Text style={styles.subtitle}>Notificaciones en tiempo real</Text>
      </View>

      {payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay pagos pendientes por verificar.</Text>
        </View>
      ) : (
        <FlatList
          data={payments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>{item.order_id}</Text>
                <Text style={styles.amount}>${item.amount.toFixed(2)} USD</Text>
              </View>
              <Text style={styles.session}>Sesión: {item.qr_session_id}</Text>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleTimeString()}
              </Text>

              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => handleVerify(item.id, item.order_id)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#090d16" />
                ) : (
                  <Text style={styles.verifyButtonText}>VERIFICAR PAGO</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    padding: 16,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748b',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#131c2e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  orderId: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  amount: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: 18,
  },
  session: {
    color: '#94a3b8',
    fontSize: 12,
  },
  date: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 4,
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#090d16',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
