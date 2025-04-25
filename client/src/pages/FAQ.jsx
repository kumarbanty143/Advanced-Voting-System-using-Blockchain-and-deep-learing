// client/src/pages/FAQ.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FAQ() {
  const faqs = [
    {
      question: "How do I register to vote in the e-voting system?",
      answer: "To register, click on the 'Register' button on the homepage. You'll need to provide your Voter ID, Aadhaar number, and create an account. After registration, you'll need to verify your identity using facial recognition before you can vote."
    },
    {
      question: "How does the face verification process work?",
      answer: "Our system uses facial recognition technology to verify your identity. During verification, your webcam will capture your face and compare it with your Aadhaar photo. The system doesn't store your actual face image, only a mathematical representation (face descriptor) for verification purposes."
    },
    {
      question: "Is my vote anonymous?",
      answer: "Yes. While the system verifies your identity to ensure you're eligible to vote, your actual vote is anonymized and encrypted. The blockchain records your vote without linking it to your personal information, ensuring complete anonymity."
    },
    {
      question: "How can I verify my vote was counted correctly?",
      answer: "After casting your vote, you'll receive a unique verification code (hash). You can use this code in the 'Verify Vote' section to confirm that your vote was recorded on the blockchain exactly as you cast it."
    },
    {
      question: "What happens if I encounter technical issues while voting?",
      answer: "If you experience technical issues, you can contact our support team through the 'Help' section. They can assist you with troubleshooting, but cannot see or modify your vote due to the encryption system."
    },
    {
      question: "Can I change my vote after submitting it?",
      answer: "No. Once you cast your vote and it's recorded on the blockchain, it cannot be changed. This is to maintain the integrity and security of the election. Make sure to review your selection carefully before submitting."
    },
    {
      question: "How secure is the e-voting system?",
      answer: "Our system uses multiple layers of security: biometric verification, end-to-end encryption, blockchain immutability, and zero-knowledge proofs. This ensures that only eligible voters can vote, votes remain anonymous, and results cannot be tampered with."
    },
    {
      question: "What happens to my data after the election?",
      answer: "Your personal information is stored securely and only used for verification purposes. After the election, sensitive biometric data is purged from the system, while basic account information is retained for audit purposes as required by election regulations."
    }
  ];
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{faq.answer}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}