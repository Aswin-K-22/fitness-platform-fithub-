import { IResponseDTO } from "./response.dto";

export interface TrainerAuth {
  id: string | null;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  verifiedByAdmin: boolean;
  profilePic: string | null;
}

export interface IGetTrainerResponseDTO extends IResponseDTO<Data>{

}
interface Data {
  trainer :TrainerAuth
}