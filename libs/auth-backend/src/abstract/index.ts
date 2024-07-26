export const userBasicSchema = (
  nameRequired: boolean = false,
  profilePictureUriRequired: boolean = false,
) => ({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: { type: String, required: true },
  full_name: {
    type: String,
    required: nameRequired,
  },
  profilePictureUri: {
    type: String,
    required: profilePictureUriRequired,
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
