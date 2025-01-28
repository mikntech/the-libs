import {
  PasswordTypes,
  Strategy,
  VerifiedContactMethod,
} from '../../../../strategy';

export const userBasicSchema = (
  { passwordTypes, verifiedContactMethod }: Partial<Strategy<any, any>>,
  nameRequired = false,
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
    required:
      passwordTypes!.length === 1 && passwordTypes![0] === PasswordTypes.HASHED,
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
