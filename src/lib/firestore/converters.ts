import { Timestamp, type FirestoreDataConverter } from "firebase/firestore";
export const timestampConverter = <
  T extends object,
>(): FirestoreDataConverter<T> => ({
  toFirestore: (value) => value as Record<string, unknown>,
  fromFirestore: (snapshot) => {
    const data = snapshot.data();
    for (const key of Object.keys(data)) {
      if (data[key] instanceof Timestamp) data[key] = data[key].toDate();
    }
    return { id: snapshot.id, ...data } as T;
  },
});
