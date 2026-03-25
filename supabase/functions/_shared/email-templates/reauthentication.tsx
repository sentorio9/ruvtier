/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
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
        <Section style={logoSection}>
          <Text style={logoText}>R U V T I E R</Text>
        </Section>
        <Section style={divider} />
        <Heading style={h1}>Verification Code</Heading>
        <Text style={text}>
          Use the code below to confirm your identity:
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you did not request this,
          you may safely disregard this message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '520px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoText = { fontSize: '16px', letterSpacing: '0.3em', color: '#3b3b3b', fontWeight: '300' as const, margin: '0' }
const divider = { borderTop: '1px solid #e0dbd4', marginBottom: '32px' }
const h1 = { fontSize: '18px', fontWeight: '300' as const, color: '#3b3b3b', margin: '0 0 20px', letterSpacing: '0.15em', textTransform: 'uppercase' as const }
const text = { fontSize: '13px', color: '#737373', lineHeight: '1.7', margin: '0 0 20px', letterSpacing: '0.03em' }
const codeStyle = { fontFamily: "'Jost', Courier, monospace", fontSize: '28px', fontWeight: '300' as const, color: '#3b3b3b', margin: '0 0 30px', letterSpacing: '0.15em', textAlign: 'center' as const }
const footer = { fontSize: '11px', color: '#a8a29e', margin: '24px 0 0', letterSpacing: '0.03em', lineHeight: '1.6' }
