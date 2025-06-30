'use client';
import { useState } from 'react';
import { login, signup } from "../../utils/supabase/authActions";
import { Form, Button, Stack } from "react-bootstrap";
import SignInWithGoogleButton from "../../components/SignInWithGoogleButton";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  return (
    <Stack  
    className="h-screen items-center justify-center">
      <Form 
      onSubmit={(e) => {
        const formData = new FormData(e.currentTarget);

        for (const [key, value] of formData.entries()) {
          console.log(`${key}: ${value}`);
        }
      }}
      >
        {isSignup && (
          <Form.Group className="mb-3">
            <Form.Label htmlFor="name">Name</Form.Label>
            <Form.Control id="name" name="name" type="text" placeholder="Your name" required />
          </Form.Group>
        )}

        <Form.Group className="mb-3" >
          <Form.Label htmlFor="email">Email address</Form.Label>
          <Form.Control id="email" name="email" type="email" placeholder="Enter email" required />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <Form.Control id="password" name="password" type="password" placeholder="Password" required />
        </Form.Group>
  
        <Stack>
            <Form.Group >
                <Button
              variant="primary"
              formAction={isSignup ? signup : login}
              type="submit"
            >
              {isSignup ? 'Sign Up' : 'Log In'}
            </Button>
                    
                    <Form.Text className="text-muted mt-3">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}
            </Form.Text>


                    <Button
              variant="link"
              className="p-0 text-decoration-underline"
              type="button"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Log in' : 'Sign up'}
            </Button>
              </Form.Group>
        </Stack>
      
      </Form>
         <span>or</span>
      <SignInWithGoogleButton />

    </Stack>

  );
}
