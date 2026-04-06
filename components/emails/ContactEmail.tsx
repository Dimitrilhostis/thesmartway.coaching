import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
  } from '@react-email/components'
  
  type ContactEmailProps = {
    firstName: string
    lastName: string
    email: string
    phone?: string
    subject: string
    message: string
  }
  
  export default function ContactEmail({
    firstName,
    lastName,
    email,
    phone,
    subject,
    message,
  }: ContactEmailProps) {
    return (
      <Html>
        <Head />
        <Preview>Nouveau message depuis le formulaire de contact</Preview>
        <Body style={{ backgroundColor: '#0d160d', color: '#EDF0E8', margin: 0, padding: '24px 0' }}>
          <Container
            style={{
              maxWidth: '640px',
              margin: '0 auto',
              backgroundColor: '#1C2B1C',
              border: '1px solid rgba(123,175,110,0.18)',
              borderRadius: '20px',
              padding: '32px',
            }}
          >
            <Heading style={{ margin: '0 0 20px', fontSize: '28px', color: '#EDF0E8' }}>
              Nouveau message de contact
            </Heading>
  
            <Section style={{ marginBottom: '20px' }}>
              <Text style={labelStyle}>Nom</Text>
              <Text style={valueStyle}>
                {firstName} {lastName}
              </Text>
            </Section>
  
            <Section style={{ marginBottom: '20px' }}>
              <Text style={labelStyle}>Email</Text>
              <Text style={valueStyle}>{email}</Text>
            </Section>
  
            <Section style={{ marginBottom: '20px' }}>
              <Text style={labelStyle}>Téléphone</Text>
              <Text style={valueStyle}>{phone?.trim() ? phone : 'Non renseigné'}</Text>
            </Section>
  
            <Section style={{ marginBottom: '20px' }}>
              <Text style={labelStyle}>Type de demande</Text>
              <Text style={valueStyle}>{subject}</Text>
            </Section>
  
            <Hr style={{ borderColor: 'rgba(123,175,110,0.18)', margin: '24px 0' }} />
  
            <Section>
              <Text style={labelStyle}>Message</Text>
              <Text style={{ ...valueStyle, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {message}
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    )
  }
  
  const labelStyle = {
    margin: '0 0 6px',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#8FA888',
  }
  
  const valueStyle = {
    margin: 0,
    fontSize: '16px',
    color: '#EDF0E8',
  }