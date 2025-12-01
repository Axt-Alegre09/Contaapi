// ============================================================================
// API: Enviar Email de Invitación
// ============================================================================
// Archivo: api/enviar-email-invitacion.js
// Ubicación: C:\AppContabilidad\api\enviar-email-invitacion.js
// Deploy: Vercel
// 
// Esta API recibe webhooks de Supabase cuando se crea una invitación
// y envía el email automáticamente con las credenciales.
// ============================================================================

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    // Supabase webhook envía los datos en req.body.record
    const invitacion = req.body.record
    
    console.log('📧 Webhook recibido:', invitacion)

    // Validar que tenemos los datos necesarios
    if (!invitacion || !invitacion.email || !invitacion.password_temporal) {
      console.error('❌ Datos incompletos:', invitacion)
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    // Obtener datos adicionales si están disponibles
    const {
      email,
      password_temporal,
      rol,
      nombre_admin,
      empresa_nombre
    } = invitacion

    // Generar HTML del email
    const htmlEmail = generarEmailHTML({
      email,
      passwordTemporal: password_temporal,
      rol: rol || 'contador',
      nombreAdmin: nombre_admin || 'El administrador',
      empresaNombre: empresa_nombre || 'ContaAPI',
      urlLogin: process.env.APP_URL || 'http://localhost:3000'
    })

    // Enviar email con Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'ContaAPI <noreply@contaapi.com>',
        to: email,
        subject: `${nombre_admin || 'Un administrador'} te invitó a ${empresa_nombre || 'ContaAPI'}`,
        html: htmlEmail
      })
    })

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text()
      console.error('❌ Error de Resend:', errorText)
      return res.status(500).json({ 
        error: 'Error al enviar email',
        details: errorText 
      })
    }

    const resendData = await resendResponse.json()
    console.log('✅ Email enviado:', resendData)

    return res.status(200).json({
      success: true,
      message: 'Email enviado exitosamente',
      emailId: resendData.id
    })

  } catch (error) {
    console.error('❌ Error general:', error)
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function generarEmailHTML(datos) {
  const rolesNombres = {
    'admin': 'Administrador',
    'contador': 'Contador',
    'asistente': 'Asistente',
    'solo_lectura': 'Solo Lectura'
  }

  const rolNombre = rolesNombres[datos.rol] || datos.rol

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
      color: white;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 0;
      opacity: 0.95;
      font-size: 16px;
    }
    .content {
      padding: 40px;
    }
    .credentials {
      background: #f7fafc;
      border-left: 4px solid #667eea;
      padding: 24px;
      margin: 24px 0;
      border-radius: 8px;
    }
    .credentials h3 {
      margin-top: 0;
      color: #667eea;
      font-size: 18px;
    }
    .credential-item {
      margin: 16px 0;
      font-size: 15px;
    }
    .credential-label {
      font-weight: 600;
      color: #4a5568;
      display: block;
      margin-bottom: 6px;
    }
    .credential-value {
      font-family: 'Courier New', monospace;
      background: white;
      padding: 12px 16px;
      border-radius: 6px;
      border: 2px solid #e2e8f0;
      display: block;
      font-weight: 600;
      font-size: 16px;
    }
    .password-value {
      color: #e53e3e;
      font-size: 18px;
      letter-spacing: 1px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 24px;
      font-size: 16px;
    }
    .button:hover {
      opacity: 0.9;
    }
    .warning {
      background: #fff5f5;
      border-left: 4px solid #f56565;
      padding: 16px;
      margin: 24px 0;
      border-radius: 6px;
      font-size: 14px;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
      font-size: 13px;
      color: #718096;
    }
    .center {
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>¡Bienvenido a ContaAPI! 🎉</h1>
      <p>
        <strong>${datos.nombreAdmin}</strong> te ha invitado a unirte a 
        <strong>${datos.empresaNombre}</strong>
      </p>
    </div>

    <div class="content">
      <h2 style="color: #667eea; margin-top: 0;">Tu cuenta está lista</h2>
      <p>
        Se ha creado una cuenta automáticamente para ti en ContaAPI. 
        Tu rol en el equipo es <strong>${rolNombre}</strong>.
      </p>

      <div class="credentials">
        <h3>🔐 Tus credenciales de acceso:</h3>
        
        <div class="credential-item">
          <span class="credential-label">📧 Email:</span>
          <span class="credential-value">${datos.email}</span>
        </div>
        
        <div class="credential-item">
          <span class="credential-label">🔑 Contraseña temporal:</span>
          <span class="credential-value password-value">${datos.passwordTemporal}</span>
        </div>
        
        <div class="credential-item">
          <span class="credential-label">👤 Tu rol:</span>
          <span class="credential-value">${rolNombre}</span>
        </div>
      </div>

      <div class="warning">
        <strong>⚠️ Importante:</strong> Esta es una contraseña temporal. 
        Te recomendamos cambiarla después de tu primer inicio de sesión por razones de seguridad.
      </div>

      <div class="center">
        <a href="${datos.urlLogin}" class="button">
          Ingresar a ContaAPI →
        </a>
      </div>

      <div class="footer">
        <p>
          <strong>Sobre tu cuenta:</strong>
        </p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Tu cuenta hereda la suscripción de ${datos.nombreAdmin}</li>
          <li>No necesitas ninguna suscripción adicional</li>
          <li>Tendrás acceso mientras la suscripción del admin esté activa</li>
        </ul>
        
        <p style="color: #a0aec0; font-size: 12px; margin-top: 24px;">
          © 2025 ContaAPI. Sistema de Contabilidad Profesional para Paraguay.<br>
          Este es un email automático, por favor no respondas a este mensaje.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `
}