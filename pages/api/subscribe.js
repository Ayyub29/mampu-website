const LIST_ID = process.env.NEXT_PUBLIC_MAILCHIMP_LIST_ID
const API_KEY = process.env.NEXT_PUBLIC_MAILCHIMP_API_KEY

export default async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      console.log(LIST_ID);
      const DATACENTER = API_KEY.split('-')[1];
      console.log(DATACENTER);
  
      const data = {
        email_address: email,
        status: 'subscribed'
      };
  
      const response = await fetch(
        `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`,
        {
          body: JSON.stringify(data),
          headers: {
            Authorization: `apikey ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          method: 'POST'
        }
      );
      // console.log(response.status);
      if (response.status >= 400) {
        return res.status(400).json({
          error: `There was an error subscribing to the newsletter. Please contact us at contact@mampu.org and We'll add you to the list.`
        });
      }
  
      return res.status(201).json({ error: '' });
    } catch (error) {
      return res.status(500).json({ error: error.message || error.toString() });
    }
  };