/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited — Ruvtier</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>R U V T I E R</Text>
        </Section>
        <Section style={divider} />
        <Heading style={h1}>You Are Invited</Heading>
        <Text style={text}>
          You have been personally invited to join the{' '}
          <Link href={siteUrl} style={link}>Ruvtier</Link> community.
          Accept below to create your account.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            ACCEPT INVITATION
          </Button>
        </Section>
        <Text style={footer}>
          If you were not expecting this invitation, you may safely disregard this message.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Jost', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '520px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logoText = { fontSize: '16px', letterSpacing: '0.3em', color: '#3b3b3b', fontWeight: '300' as const, margin: '0' }
const divider = { borderTop: '1px solid #e0dbd4', marginBottom: '32px' }
const h1 = { fontSize: '18px', fontWeight: '300' as const, color: '#3b3b3b', margin: '0 0 20px', letterSpacing: '0.15em', textTransform: 'uppercase' as const }
const text = { fontSize: '13px', color: '#737373', lineHeight: '1.7', margin: '0 0 20px', letterSpacing: '0.03em' }
const link = { color: '#3b3b3b', textDecoration: 'underline' }
const buttonSection = { textAlign: 'center' as const, marginBottom: '32px' }
const button = { backgroundColor: '#3b3b3b', color: '#f2ede7', fontSize: '11px', letterSpacing: '0.2em', borderRadius: '0px', padding: '14px 32px', textDecoration: 'none', fontFamily: "'Jost', Arial, sans-serif" }
const footer = { fontSize: '11px', color: '#a8a29e', margin: '24px 0 0', letterSpacing: '0.03em', lineHeight: '1.6' }
