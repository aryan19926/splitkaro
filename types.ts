import { PermissionsAndroid } from 'react-native';

export interface SMS {
  _id: string;
  thread_id: string;
  address: string;
  person: string | null;
  date: string;
  date_sent: string;
  protocol: number;
  read: number;
  status: number;
  type: number;
  body: string;
  service_center: string | null;
}

export type RequestPermissionResult = ReturnType<typeof PermissionsAndroid.request>;