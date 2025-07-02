"use client";
import { useState } from "react";
import { login, signup } from "../../utils/supabase/authActions";
import { Form, Button, Stack } from "react-bootstrap";
import SignInWithGoogleButton from "../../components/SignInWithGoogleButton";


export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  return (
    <Stack className="h-screen items-center justify-center">
      <Form
        onSubmit={async (e) => {
          const formData = new FormData(e.currentTarget);

          for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
          }
        const result = await signup(formData)

          if (result?.error) {
            setError(result.error)
            setMessage("")
          } else if (result?.message) {
            setMessage(result.message)
            setError("")
          }
        }}
      >
        {isSignup && (
          <Form.Group className="mb-3">
            <Form.Label htmlFor="name">Name</Form.Label>
            <Form.Control
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              required
            />
          </Form.Group>
        )}

        <Form.Group className="mb-3">
          <Form.Label htmlFor="email">Email address</Form.Label>
          <Form.Control
            id="email"
            name="email"
            type="email"
            placeholder="Enter email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label htmlFor="password">Password</Form.Label>
          <Form.Control
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            required
          />
        </Form.Group>

        <Stack>
          <Form.Group className="flex flex-column align-items-center">
            <Button
              variant="primary"
              formAction={isSignup ? signup : login}
              type="submit"
            >
              {isSignup ? "Sign Up" : "Log In"}
            </Button>
            
           <Form.Group className="mt-2">
            <Form.Text className="text-muted mt-5 mr-2">
              {isSignup ? "Already have an account?" : "Don't have an account?"}
            </Form.Text>

            <Button
              variant="link"
              className="p-0 text-decoration-underline"
              type="button"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? "Log in" : "Sign up"}
            </Button>
           </Form.Group>
            
          </Form.Group>
        </Stack>
      </Form>
      <Form.Text className="text-muted mb-3">or</Form.Text>
      
      <SignInWithGoogleButton />
     
      {message && <p className="text-success mt-3 text-red-600!">{message}</p>}
      {error && <p className="text-danger mt-3">{error}</p>}
    </Stack>
  );
}
