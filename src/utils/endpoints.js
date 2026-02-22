const URL_API = import.meta.env.API_URL_RULETA || 'https://api_ruleta.claromarketingcloud.pe/api'

const isBrowser = typeof window !== 'undefined' && typeof navigator !== 'undefined';
let uaParserPromise;
let fingerprintAgentPromise;

async function loadUAParser() {
  if (!uaParserPromise) {
    uaParserPromise = import('ua-parser-js')
      .then((mod) => mod.default ?? mod.UAParser ?? null)
      .catch(() => null);
  }
  return uaParserPromise;
}

async function loadFingerprintAgent() {
  if (!fingerprintAgentPromise) {
    fingerprintAgentPromise = import('@fingerprintjs/fingerprintjs')
      .then((mod) => {
        const FingerprintJS = mod.default ?? mod;
        return FingerprintJS?.load ? FingerprintJS.load() : null;
      })
      .catch(() => null);
  }
  return fingerprintAgentPromise;
}

function getScreenInfo() {
  if (!isBrowser) {
    return {
      resolution: null,
      viewport: null,
      colorDepth: null,
      pixelRatio: null
    };
  }

  return {
    resolution: window.screen.width + 'x' + window.screen.height,
    viewport: window.innerWidth + 'x' + window.innerHeight,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio
  };
}

function buildBaseDeviceInfo() {
  const screen = getScreenInfo();
  return {
    deviceFingerprint: null,
    userAgent: isBrowser ? navigator.userAgent : null,
    browserName: null,
    browserVersion: null,
    browserLanguage: isBrowser ? navigator.language || null : null,
    osName: null,
    osVersion: null,
    deviceType: null,
    deviceVendor: null,
    deviceModel: null,
    screenResolution: screen.resolution,
    viewportSize: screen.viewport,
    colorDepth: screen.colorDepth,
    pixelRatio: screen.pixelRatio,
    ipAddress: null,
    countryCode: null,
    city: null
  };
}


export async function getDepartament() {
  try {
    const response = await fetch(`${URL_API}/Provinces/departments`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Error getDepartament (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getDepartament:', error);
    throw error;
  }
}

export async function getProvince(departmentId) {
  try {
    const response = await fetch(`${URL_API}/Provinces/departments/${departmentId}/provinces`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Error getProvince (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getProvince:', error);
    throw error;
  }
}

export async function preCheck(phone) {
  try {
    const response = await fetch(`${URL_API}/Auth/precheck`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "docNumber": phone
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

export async function registerUser({
  name,
  emailConfirm,
  serviceId,
  docType,
  docNumber,
  provinceId,
  telefono = "",
  deviceInfo
}) {
  try {
    const bodyData = {
      name,
      email: emailConfirm, // email final
      serviceId,
      telefono: telefono || "", // siempre string
      docType,
      docNumber,
      provinceId,
      deviceInfo
    };

    // console.log("=== DATOS QUE SE ENVIAN DESDE registerUser ===");
    // console.log("URL:", `${URL_API}/Auth/register`);
    // console.log("Body que se enviará:", bodyData);
    // console.log("JSON que se enviará:", JSON.stringify(bodyData));
    // console.log("==============================================");

    const response = await fetch(`${URL_API}/Auth/register`, {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyData)
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`Error registerUser (${response.status}): ${errorBody}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Error en registerUser:", error);
    throw error;
  }
}



export async function verifyCode(code) {
  try {
    const response = await fetch(`${URL_API}/Auth/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
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

export async function getListProducts(provinceId, serviceId) {
  try {
    const response = await fetch(`${URL_API}/Provinces/${provinceId}/allowed-prize-types?serviceId=${serviceId}`, {
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

export async function validUserEnabled(serviceId, userId) {
  try {
    const response = await fetch(`${URL_API}/Spin/eligibility?serviceId=${serviceId}&userId=${userId}`, {
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

export async function spinSaveResult(serviceId, prizeTypeId) {
  try {
    const response = await fetch(`${URL_API}/Spin/execute-by-type`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceId,
        prizeTypeId
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorBody = errorData?.message || (await response.text().catch(() => ''));
      const error = new Error(`Error spinSaveResult (${response.status}): ${errorBody}`);
      error.status = response.status;
      error.result = errorData?.result;
      error.apiMessage = errorData?.message;
      throw error;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error en spinSaveResult:', error);
    throw error;
  }
}


export async function deleteUserByDni(docNumber) {
  try {
    const response = await fetch(`${URL_API}/auth/cleanup-by-dni`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        docNumber
      })
    })
    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new Error(`Error deleteUserByDni (${response.status}): ${errorBody}`);
    }
    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error en deleteUserByDni:', error);
    throw error;
  }
}

export async function getDeviceInfo() {
  try {
    const baseInfo = buildBaseDeviceInfo();
    if (!isBrowser) {
      return baseInfo;
    }

    const UAParserCtor = await loadUAParser();
    if (!UAParserCtor) {
      return baseInfo;
    }

    // Parser de User Agent
    const parser = new UAParserCtor();
    const result = parser.getResult();

    // Fingerprint del dispositivo (única)
    const fpAgent = await loadFingerprintAgent();
    let fingerprintId = null;
    if (fpAgent) {
      const fingerprint = await fpAgent.get();
      fingerprintId = fingerprint?.visitorId ?? null;
    }

    // Determinar tipo de dispositivo
    let deviceType = 'desktop';
    if (result.device.type === 'mobile') {
      deviceType = 'mobile';
    } else if (result.device.type === 'tablet') {
      deviceType = 'tablet';
    }

    return {
      ...baseInfo,
      deviceFingerprint: fingerprintId,
      userAgent: navigator.userAgent,
      browserName: result.browser.name || null,
      browserVersion: result.browser.version || null,
      browserLanguage: navigator.language || null,
      osName: result.os.name || null,
      osVersion: result.os.version || null,
      deviceType: deviceType,
      deviceVendor: result.device.vendor || null,
      deviceModel: result.device.model || null
    };
  } catch (error) {
    console.error('Error obteniendo información del dispositivo:', error);

    // Fallback: información mínima y consistente
    return buildBaseDeviceInfo();
  }
}

