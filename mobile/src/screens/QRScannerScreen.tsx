import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

export function QRScannerScreen() {
  const [scanned, setScanned] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);

  const handleBarCodeScanned = (data: string) => {
    setScanned(true);
    setLastScannedData(data);

    try {
      const parsed = JSON.parse(data);
      Alert.alert(
        'QR Escaneado',
        `Orden: ${parsed.order_id || 'N/A'}\nMonto: $${parsed.amount || '0'} USD`,
        [
          {
            text: 'Validar Pago',
            onPress: () => {
              Alert.alert('Éxito', 'Pago validado presencialmente');
              setScanned(false);
            },
          },
          { text: 'Cancelar', onPress: () => setScanned(false), style: 'cancel' },
        ]
      );
    } catch {
      Alert.alert('Datos Escaneados', data, [
        { text: 'OK', onPress: () => setScanned(false) },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escáner QR Presencial</Text>
        <Text style={styles.subtitle}>Apunta la cámara al código QR del cliente</Text>
      </View>

      <View style={styles.cameraBox}>
        <View style={styles.overlayFrame} />
        <Text style={styles.overlayText}>Enfoca el código en el marco</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.simButton}
          onPress={() =>
            handleBarCodeScanned(
              JSON.stringify({
                order_id: 'ORD-SCAN-1234',
                amount: 75.0,
                store: 'TACTICOS',
              })
            )
          }
        >
          <Text style={styles.simButtonText}>Simular Escaneo de QR</Text>
        </TouchableOpacity>
      </View>
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
    marginTop: 10,
    marginBottom: 20,
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
  cameraBox: {
    flex: 1,
    backgroundColor: '#131c2e',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  overlayFrame: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: '#f59e0b',
    borderRadius: 16,
  },
  overlayText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 16,
  },
  footer: {
    marginTop: 20,
    marginBottom: 10,
  },
  simButton: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#f59e0b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  simButtonText: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
