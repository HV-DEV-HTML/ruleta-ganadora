const URL_API = 'https://api-ruleta.dev-limprod.com/api'


export async function preCheck(phone){
  try {
    const response = await fetch(`${URL_API}/Auth/precheck`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "docNumber" : phone
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Error precheck (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en preCheck:', error);
    throw error;
  }
}

export async function registerUser(name, email, phone, serviceId, docType, docNumber){
  try {
   const response = await fetch(`${URL_API}/Auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        serviceId,
        docType,
        docNumber
      })
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Error registerUser (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data;    
    
  } catch (error) {
    console.error('Error en registerUser:', error);
    throw error;
  }
}

export async function verifyCode(email, code){
  try {
    const response = await fetch(`${URL_API}/Auth/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        code
      })
    });
    // La API puede devolver 400 con un cuerpo útil (verified, message, token, etc.)
    const data = await response.json().catch(() => null);

    // Para 400 devolvemos el cuerpo tal cual para que el frontend use message/verified
    if (response.status === 400) {
      return data || { verified: false, message: 'Código inválido' };
    }

    // Para otros códigos no OK, lanzamos error
    if (!response.ok) {
      const errorBody = data ? JSON.stringify(data) : await response.text().catch(() => '');
      throw new Error(`Error verifyCode (${response.status}): ${errorBody}`);
    }

    return data;    
    
  } catch (error) {
    console.error('Error en verifyCode:', error);
    throw error;
  }
}

export async function getListProducts(serviceId){
  try {
    const response = await fetch(`${URL_API}/admin/prizes/available?serviceId=${serviceId}`, {
      method: 'GET',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Error getListProducts (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data;    
    
  } catch (error) {
    console.error('Error en getListProducts:', error);
    throw error;
  }
}

export async function validUserEnabled(serviceId){
  try {
    const response = await fetch(`${URL_API}/Spin/eligibility?serviceId=${serviceId}`, {
      method: 'GET',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Error validUserEnabled (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data;    
    
  } catch (error) {
    console.error('Error en validUserEnabled:', error);
    throw error;
  }
}