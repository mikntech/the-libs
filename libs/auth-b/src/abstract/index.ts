export const userBasicSchema = (
  nameRequired: boolean = false,
  profilePictureUriRequired: boolean = false
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
    requiured: profilePictureUriRequired,
  },
});
