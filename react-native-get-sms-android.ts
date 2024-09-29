// react-native-get-sms-android.d.ts

declare module 'react-native-get-sms-android' {
    interface SmsFilter {
      box?: 'inbox' | 'sent' | 'draft';
      indexFrom?: number;
      maxCount?: number;
      address?: string;
      body?: string;
      read?: 0 | 1;
      _id?: string;
      thread_id?: string;
      minDate?: number;
      maxDate?: number;
    }
  
    interface SmsAndroid {
      list: (
        filter: string,
        fail: (error: string) => void,
        success: (count: number, smsList: string) => void
      ) => void;
    }
  
    const SmsAndroid: SmsAndroid;
    export default SmsAndroid;
  }