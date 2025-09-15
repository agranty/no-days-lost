import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dumbbell } from 'lucide-react';

export default function FAQ() {
  const faqCategories = [
    {
      title: "Getting Started",
      faqs: [
        {
          question: "What is No Days Lost?",
          answer: "No Days Lost is a workout tracking app that helps you log workouts, track weight, visualize progress, and generate personalized AI workouts so you can build consistency and see results."
        },
        {
          question: "How do I sign up?",
          answer: "Click \"Sign Up\" on the homepage, create your account, and you can start logging workouts and weight immediately."
        },
        {
          question: "Does it work on mobile?",
          answer: "Yes, the web app is fully responsive and works on phones, tablets, and desktops. An iOS app version is also planned."
        }
      ]
    },
    {
      title: "Features",
      faqs: [
        {
          question: "What can I track in the app?",
          answer: "You can log strength training (sets, reps, weight, RPE, rest), cardio sessions (time, distance, type), body weight, mindset, and more."
        },
        {
          question: "What is the AI workout generator?",
          answer: "Our AI-powered generator creates personalized workouts based on body parts, available time, equipment, and intensity. It adapts to your recent training history."
        },
        {
          question: "Can I add custom exercises?",
          answer: "Yes, you can add and save custom exercises under body parts so they show up in future logs."
        },
        {
          question: "How does progress tracking work?",
          answer: "Progress tracking includes PRs, 1RM estimates, body-part volume, streak counters, and daily/weekly summaries."
        }
      ]
    },
    {
      title: "Free vs Pro",
      faqs: [
        {
          question: "What's included in the Free plan?",
          answer: "Free users can log workouts, track weight, and view the last 2 days of history."
        },
        {
          question: "What extra features come with Pro?",
          answer: "Pro unlocks unlimited history, AI daily summaries, the AI workout generator, Google Sheets export, and advanced charts."
        },
        {
          question: "Can I try Pro before committing?",
          answer: "Yes, we offer flexible monthly and annual plans. Trial promotions may also be available on the Upgrade page."
        }
      ]
    },
    {
      title: "Tracking & Data",
      faqs: [
        {
          question: "Can I export my data?",
          answer: "Pro users can export their entire workout and weight history to Google Sheets."
        },
        {
          question: "What units are supported?",
          answer: "Both pounds (lb) and kilograms (kg). You can set your default unit in your profile."
        },
        {
          question: "What happens if I miss a day?",
          answer: "Your streak counter resets, but your history remains intact. The streak tracker is designed to motivate, not punish."
        }
      ]
    },
    {
      title: "Account & Profile",
      faqs: [
        {
          question: "How do I update my profile?",
          answer: "Go to your Profile page to update your name, birthday (month/day), or fitness goals."
        },
        {
          question: "Can I change my email?",
          answer: "At this time, email changes require contacting support at support@nodayslost.app."
        },
        {
          question: "What happens to my data if I cancel Pro?",
          answer: "Your data remains saved. You'll still have access to Free features, but Pro features will be locked until you upgrade again."
        }
      ]
    },
    {
      title: "Security & Privacy",
      faqs: [
        {
          question: "How is my data stored?",
          answer: "Data is securely stored in the cloud using trusted infrastructure. We never sell personal information."
        },
        {
          question: "Is payment information safe?",
          answer: "Yes, all payments are securely processed by Stripe."
        },
        {
          question: "Do you share my workout data?",
          answer: "No, your data is private and only visible to you unless you export it."
        }
      ]
    },
    {
      title: "Support",
      faqs: [
        {
          question: "How do I contact support?",
          answer: "Email us anytime at support@nodayslost.app. We usually respond within 24–48 hours."
        },
        {
          question: "Do you take feature requests?",
          answer: "Absolutely! Send suggestions to support@nodayslost.app — we're building this app for people like you."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">No Days Lost</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about No Days Lost.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="max-w-4xl mx-auto space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className="text-2xl">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {category.faqs.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border-b last:border-b-0"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 pt-0">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <Card className="bg-muted/50">
            <CardContent className="pt-8 pb-8">
              <p className="text-lg text-muted-foreground mb-6">
                Didn't find what you're looking for? Contact us at{' '}
                <a 
                  href="mailto:support@nodayslost.app" 
                  className="text-primary font-medium hover:underline"
                >
                  support@nodayslost.app
                </a>
              </p>
              <Button size="lg" asChild>
                <Link to="/auth">Sign Up Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}