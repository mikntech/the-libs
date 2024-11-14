import {
  PasswordType,
  Strategy,
  VerifiedContactMethod,
} from '../../../../strategy';

export const userBasicSchema = (
  { passwordType, verifiedContactMethod }: Partial<Strategy<any, any>>,
  nameRequired: boolean = false,
) => ({
  email: {
    type: String,
    required: verifiedContactMethod === VerifiedContactMethod.EMAIL,
    unique: verifiedContactMethod === VerifiedContactMethod.EMAIL,
  },
  phone: {
    type: String,
    required: verifiedContactMethod === VerifiedContactMethod.SMS,
    unique: verifiedContactMethod === VerifiedContactMethod.SMS,
  },
  password: {
    type: String,
    required: passwordType === PasswordType.HASHED,
  },
  full_name: {
    type: String,
    required: nameRequired,
  },
  profilePictureUri: {
    type: String,
    required: false,
  },
});

export const requestBasicSchema = (userTypeRelevant: boolean = false) => ({
  email: {
    type: String,
    required: true,
  },
  userType: { type: String, required: userTypeRelevant },
  key: {
    type: String,
    required: true,
  },
});
