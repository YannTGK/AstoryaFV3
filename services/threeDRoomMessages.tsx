// services/threeDRoomMessages.ts
import api from "@/services/api";

export interface ThreeDRoomMessage {
  _id: string;
  message: string;
  sender: {
    _id: string;
    name: string;
  };
  addedAt: string;
}

export const getThreeDRoomMessages = async (
  starId: string,
  roomId: string
): Promise<ThreeDRoomMessage[]> => {
  const res = await api.get<ThreeDRoomMessage[]>(
    `/stars/${starId}/three-d-rooms/${roomId}/messages`
  );
  return res.data;
};

export const postThreeDRoomMessage = async (
  starId: string,
  roomId: string,
  message: string
): Promise<ThreeDRoomMessage> => {
  const res = await api.post<ThreeDRoomMessage>(
    `/stars/${starId}/three-d-rooms/${roomId}/messages`,
    { message }
  );
  return res.data;
};
