import React from 'react';
import FeatureCard from "./FeatureCard";
import { motion } from 'framer-motion';

const FeaturesSection = () => {
  return (
  <motion.main 
    className="container mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mt-6 px-6 sm:px-8 lg:px-12"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.8, delay: 0.8 }}
  >
      <FeatureCard
        title="Front Desk Supercharged"
        description="Empower your reception team with tools designed for efficiency and a seamless member experience."
        color="text-blue-600"
        features={[
          {
            text: "Instant member check-in & status",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            ),
          },
          {
            text: "Effortless new sign-ups & payment processing",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V17a2 2 0 002 2H20M3 7h18M3 11h18M3 15h18"
              />
            ),
          },
          {
            text: "Simple class booking & schedule management",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            ),
          },
          {
            text: "Quick access to member profiles & updates",
            icon: (
              <>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7 1.274 4.057-1.178 8.943-4.542 12 4.479-3.057 7.898-7.943 9.172-12-1.274-4.057-4.965-7-9.542-7-4.477 0-8.268 2.943-9.542 7-1.274 4.057 1.177 8.943 4.542 12z"
                />
              </>
            ),
          },
        ]}
      />

      <FeatureCard
        title="Business Insights at Your Fingertips"
        description="Take control of your gym's performance with powerful analytics and management features."
        color="text-green-600"
        features={[
          {
            text: "Real-time reports on growth, revenue & attendance",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            ),
          },
          {
            text: "Staff performance tracking & management tools",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            ),
          },
          {
            text: "Seamless billing, membership & inventory oversight",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 4v4a2 2 0 002 2h2m-4-4H9m12 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 00-.707-.293H3"
              />
            ),
          },
          {
            text: "Direct communication channels with your team",
            icon: (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            ),
          },
        ]}
      />
    </motion.main>
  );
};

export default FeaturesSection;
