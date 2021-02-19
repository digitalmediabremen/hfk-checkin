# HfK-Checkin

## How to run the application locally

1. Set environent variables in `.env.local` in order to run the application:
   
      ```
      File: .env.local
      
      NEXT_PUBLIC_API_URL=http://localhost:8000
      NEXT_PUBLIC_BASE_URL=http://localhost:3000
      NEXT_PUBLIC_FEATURE_CHECKIN=1
      // OR
      NEXT_PUBLIC_FEATURE_GETIN=1
      ```

2. Generate validation files. (currently only runs on osx systems)

      `npm run validate`
      
3. Run the development server

      `npm run dev`

4. Create a translation file if you changed or added translatable text

      `npm run translate`

       
## HfK-Getin

In order to see the getin application set your `.env` as follows:
```
NEXT_PUBLIC_FEATURE_CHECKIN=0
NEXT_PUBLIC_FEATURE_GETIN=1
```
