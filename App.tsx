import React, { useState } from 'react';
import { Text, View, PermissionsAndroid, FlatList, StyleSheet, Button } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

interface SMS {
  body: string;
  date: string;
}

interface Transaction {
  amount: number;
  date: string;
  description: string;
  balance: number;
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function requestPermission(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "Read SMS permission is required",
          message: "This app needs access to your SMS to function properly.",
          buttonPositive: "OK",
          buttonNegative: "Cancel",
          buttonNeutral: "Ask Me Later",
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }

  function parseTransaction(body: string): Transaction | null {
    const regex = /Rs\. ([\d,]+\.?\d*).*on (\d{2}-\d{2}-\d{4}).*at (.+)\. Avl Bal: Rs\. ([\d,]+\.?\d*)/;
    const match = body.match(regex);
    if (match) {
      return {
        amount: parseFloat(match[1].replace(',', '')),
        date: match[2],
        description: match[3],
        balance: parseFloat(match[4].replace(',', '')),
      };
    }
    return null;
  }

  async function fetchTransactions() {
    try {
      const hasPermission = await requestPermission();
      if (hasPermission) {
        SmsAndroid.list(
          JSON.stringify({
            box: 'sent',
            maxCount: 30, // Increased to potentially capture more relevant messages
          }),
          (fail: string) => {
            console.log("Failed to fetch messages:", fail);
            setError(`Failed to fetch messages: ${fail}`);
          },
          (count: number, messagesJson: string) => {
            const sms: SMS[] = JSON.parse(messagesJson);
            console.log(sms);
            const parsedTransactions = sms
              .map(message => parseTransaction(message.body))
              .filter((transaction): transaction is Transaction => transaction !== null);
              console.log(parsedTransactions);
            setTransactions(parsedTransactions);
          }
        );
      } else {
        setError('SMS permission not granted');
      }
    } catch (err) {
      console.error('Error in fetchTransactions:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionContainer}>
      <Text style={styles.date}>{item.date}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.amount}>Rs. {item.amount.toFixed(2)}</Text>
      <Text style={styles.balance}>Balance: Rs. {item.balance.toFixed(2)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button title="View Expenses" onPress={fetchTransactions} />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text>No transactions found</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  transactionContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  amount: {
    fontSize: 16,
    color: 'red',
  },
  balance: {
    fontSize: 14,
    color: 'green',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
});