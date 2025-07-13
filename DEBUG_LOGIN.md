# Debug Login Issue

## Masalah
Setelah login berhasil, halaman masih menampilkan login meskipun sudah di redirect ke `/dashboard`.

## Penyebab yang Mungkin

### 1. Session Management
- Session tidak tersimpan dengan benar di server
- Session tidak dikirim dengan benar ke client
- Session middleware tidak berfungsi

### 2. State Management
- `isAuthenticated` state tidak terupdate dengan benar
- React Query cache tidak terupdate
- Component tidak re-render setelah state change

### 3. Routing
- React Router tidak menangani redirect dengan benar
- Route protection tidak berfungsi

## Debugging Steps

### 1. Check Server Logs
```bash
# Jalankan server dan lihat console logs
npm run dev
```

### 2. Check Browser Console
- Buka Developer Tools
- Lihat Console untuk debug logs
- Check Network tab untuk API calls

### 3. Check Session
- Buka Application tab di DevTools
- Lihat Cookies untuk session
- Check Local Storage

## Perbaikan yang Sudah Dilakukan

### 1. Session Management
- Menambahkan `req.session.save()` untuk memastikan session tersimpan
- Menambahkan `req.session.regenerate()` untuk keamanan
- Menambahkan debugging logs

### 2. State Management
- Memperbaiki AuthContext untuk update state dengan benar
- Menambahkan `queryClient.refetchQueries()` setelah login
- Menambahkan debugging untuk state changes

### 3. Routing
- Menggunakan `setLocation()` dari wouter instead of `window.location.href`
- Memperbaiki logic routing di App.tsx
- Menambahkan debugging untuk routing decisions

## Testing Steps

1. **Clear Browser Data**
   - Clear cookies, local storage, session storage
   - Hard refresh (Ctrl+F5)

2. **Test Login Flow**
   - Buka `http://localhost:5000`
   - Login dengan demo account
   - Perhatikan console logs
   - Check apakah redirect ke dashboard

3. **Check Network Requests**
   - Monitor `/api/auth/login` request
   - Monitor `/api/auth/me` request
   - Check response status dan data

## Expected Behavior

1. User login dengan email/password
2. Server validate credentials
3. Server create session dan save
4. Client receive success response
5. AuthContext update `isAuthenticated` to true
6. Router detect authentication change
7. Router show protected routes (Dashboard)
8. User redirected to `/dashboard`

## Debug Commands

```bash
# Start server with debugging
npm run dev

# Check if server is running
curl http://localhost:5000/api/auth/me

# Test login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ahmad.sutrisno@intek.co.id","password":"password123"}'
``` 