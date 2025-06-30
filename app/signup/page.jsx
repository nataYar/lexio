'use client';
import {  signup } from "../../utils/supabase/authActions";
import { Form, Button, Stack } from "react-bootstrap";
import SignInWithGoogleButton from "../../components/SignInWithGoogleButton";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

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
        <Form.Group className="mb-3">
          <Form.Label htmlFor="name">Name</Form.Label>
          <Form.Control id="name" name="name" type="name" placeholder="Name" required />
        </Form.Group>

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
                <Button variant="primary" 
                formAction={signup} 
                type="submit"
                >
                      Sign up
                    </Button>
                    
                    <Form.Text className="text-muted ml-4 mr-2">
                      Already have an account? 
                    </Form.Text>
                    <Button
                      variant="link"
                      className=" p-0 text-decoration-underline"
                        type="button"
                        onClick={() => router.push("/login")}
                    >
                      Log in
                    </Button>
              </Form.Group>
        </Stack>
      
      </Form>
         <span>or</span>
      <SignInWithGoogleButton />

    </Stack>

  );
}
