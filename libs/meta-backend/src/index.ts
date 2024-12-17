import axios from 'axios';

const PAGE_ACCESS_TOKEN = 'YOUR_PAGE_ACCESS_TOKEN';
const PAGE_ID = 'YOUR_PAGE_ID';

export async function postToFacebook(message: string) {
  const url = `https://graph.facebook.com/v12.0/${PAGE_ID}/feed`;

  try {
    const response = await axios.post(url, {
      message: message,
      access_token: PAGE_ACCESS_TOKEN,
    });

    if (response.status === 200) {
    }
  } catch (error: any) {
    
      'Error posting to Facebook:',
      error.response?.data || error.message,
    );
  }
}

// Example message to post
const postMessage =
  'Hello, this is an automated post from my TypeScript script!';
postToFacebook(postMessage);
