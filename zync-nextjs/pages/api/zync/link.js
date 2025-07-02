export default function handler(req, res) {
  if (req.method === 'POST') {
    // Placeholder: handle POST request
    res.status(200).json({ message: 'POST /api/zync/link endpoint restored.' });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
} 