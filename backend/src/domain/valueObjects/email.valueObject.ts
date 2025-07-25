//src/domain/valueObjects/email.valueObject.ts
import { EmailErrorType } from '../enums/emailErrorType.enum';

interface EmailProps {
  address: string;
}


export class Email {
  private _address: string;

  constructor(props: EmailProps) {
    if (!props.address) {
      throw new Error(EmailErrorType.MissingEmail);
    }
     if (!this.validate(props.address)) {
      throw new Error(EmailErrorType.InvalidEmail);
    }

    this._address = props.address.toLowerCase();
}
 private validate(email: string): boolean {
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return regex.test(email);
  }

    get address(): string {
    return this._address;
  }
}