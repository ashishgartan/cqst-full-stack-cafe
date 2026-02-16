
exports.submitSupportRequest = async (req, res) => {
  try {
    const { name, orderId, subject, message } = req.body;

    // 1. Validation
    if (!name || !message) {
      return res.status(400).send("Please fill in all required fields.");
    }

    // 2. Logic: You could save this to a 'Support' Collection or send an Email
    console.log(`Support Request from ${name}:`, { orderId, subject, message });

    // 3. Response
    res.status(200).send(`
            <script>
                alert('Thank you, ${name}. Your message has been received!');
                window.location.href = '/';
            </script>
        `);
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
};
