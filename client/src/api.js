document.cookie =
  "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; httpOnly";

// 3. API isteklerinde CSRF koruması ekleyin
// Her API isteğine X-CSRF-TOKEN header'ı ekleyin

// 4. Tüm API çağrılarında hata yönetimini iyileştirin
try {
  const response = await fetch("/api/resource");
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error("API request failed:", error);
}
