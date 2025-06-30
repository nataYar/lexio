"use client";
import Button from 'react-bootstrap/Button';
import { signInWithGoogle } from "../utils/supabase/authActions";
import React from "react";

const SignInWithGoogleButton = () => {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={signInWithGoogle}
    >
      Login with Google
    </Button>
  );
};

export default SignInWithGoogleButton;