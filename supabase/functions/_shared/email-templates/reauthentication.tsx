/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code — Ruvtier</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>RUVTIER</Text>
        <Hr style={divider} />
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you did not request this, you may safely disregard this message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '520px', margin: '0 auto' }
const brand = { fontSize: '13px', fontWeight: '400' as const, letterSpacing: '0.2em', color: '#3b3b3b', textAlign: 'center' as const, margin: '0 0 24px' }
const divider = { borderTop: '1px solid #e0dbd4', margin: '0 0 32px' }
const h1 = { fontSize: '20px', fontWeight: '300' as const, letterSpacing: '0.08em', color: '#3b3b3b', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#737373', lineHeight: '1.6', margin: '0 0 28px', fontWeight: '300' as const }
const codeStyle = { fontFamily: "'Jost', Courier, monospace", fontSize: '28px', fontWeight: '300' as const, letterSpacing: '0.15em', color: '#3b3b3b', margin: '0 0 32px' }
const footer = { fontSize: '11px', color: '#a0a0a0', margin: '32px 0 0', fontWeight: '300' as const }
