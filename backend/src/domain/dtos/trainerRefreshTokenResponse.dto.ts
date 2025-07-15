import { TrainerAuth } from './getTrainerResponse.dto';
import { IResponseDTO } from './response.dto';

export interface ITrainerRefreshTokenResponseDTO extends IResponseDTO<IData>{  
}
interface IData{
  
    trainer: TrainerAuth;
    accessToken: string;
    refreshToken: string;
  
}