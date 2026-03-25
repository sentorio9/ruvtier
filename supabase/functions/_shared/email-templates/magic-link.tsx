/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ siteName, confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your login link — Ruvtier</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>RUVTIER</Text>
        <Hr style={divider} />
        <Heading style={h1}>Your login link</Heading>
        <Text style={text}>
          Click the button below to sign in. This link will expire shortly.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Sign In
        </Button>
        <Text style={footer}>
          If you did not request this link, you may safely disregard this message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '520px', margin: '0 auto' }
const brand = { fontSize: '13px', fontWeight: '400' as const, letterSpacing: '0.2em', color: '#3b3b3b', textAlign: 'center' as const, margin: '0 0 24px' }
const divider = { borderTop: '1px solid #e0dbd4', margin: '0 0 32px' }
const h1 = { fontSize: '20px', fontWeight: '300' as const, letterSpacing: '0.08em', color: '#3b3b3b', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#737373', lineHeight: '1.6', margin: '0 0 28px', fontWeight: '300' as const }
const button = { backgroundColor: '#3b3b3b', color: '#f2ede7', fontSize: '12px', letterSpacing: '0.12em', borderRadius: '0px', padding: '14px 28px', textDecoration: 'none', textTransform: 'uppercase' as const, fontWeight: '400' as const }
const footer = { fontSize: '11px', color: '#a0a0a0', margin: '32px 0 0', fontWeight: '300' as const }
