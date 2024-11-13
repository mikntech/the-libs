import {
  PasswordType,
  Strategy,
  VerifiedContactMethod,
} from '../../../../strategy';

export const userBasicSchema = (
  strategy: Strategy<{}, {}>,
  nameRequired: boolean = false,
) => ({
  email: {
    type: String,
    required: strategy.verifiedContactMethod === VerifiedContactMethod.EMAIL,
    unique: true,
  },
  phone: {
    type: String,
    required: strategy.verifiedContactMethod === VerifiedContactMethod.SMS,
    unique: true,
  },
  password: {
    type: String,
    required: strategy.passwordType === PasswordType.HASHED,
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
