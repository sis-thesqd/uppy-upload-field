# Uppy Upload Field

A React component for file uploads using Uppy with Tailwind CSS styling.

## Installation

```bash
npm install @sis-thesqd/uppy-upload-field
```

## Usage

```tsx
import { FileUploadField } from '@sis-thesqd/uppy-upload-field';
import '@sis-thesqd/uppy-upload-field/styles.css';

function MyForm() {
  const [files, setFiles] = useState<string[]>([]);

  return (
    <FileUploadField
      id="file-upload"
      value={files}
      onChange={setFiles}
      config={{
        maxFiles: 10,
        maxSizeMB: 1024,
        accept: ['image/*', 'video/*', '.pdf'],
        helpText: 'Upload your files here'
      }}
      required={false}
      disabled={false}
    />
  );
}
```

## Props

- `id` (string, required): Unique identifier for the uploader instance
- `value` (string[], required): Array of uploaded file URLs
- `onChange` ((value: string[]) => void, required): Callback when files are uploaded/removed
- `config` (FileUploadConfig, required): Configuration object for the uploader
  - `maxFiles` (number, optional): Maximum number of files allowed (default: 10)
  - `maxSizeMB` (number, optional): Maximum file size in MB (default: 1024)
  - `accept` (string[], optional): Array of accepted file types (default: ['image/*', 'video/*', '.pdf', '.doc', '.docx'])
  - `helpText` (string, optional): Help text to display in the upload area
- `required` (boolean, optional): Whether the field is required (default: false)
- `disabled` (boolean, optional): Whether the field is disabled (default: false)
- `error` (string, optional): Error message to display
- `touched` (boolean, optional): Whether the field has been touched (for validation)
- `account` (number, optional): Account number to include in upload URL

## Environment Variables

This component requires AWS S3 credentials to be configured in your application's environment variables. Add the following to your `.env.local` file:

```bash
# AWS S3 Configuration
NEXT_PUBLIC_AWS_S3_BUCKET=your-bucket-name
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key-id
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

**Required Environment Variables:**

- `NEXT_PUBLIC_AWS_S3_BUCKET`: The name of your S3 bucket where files will be uploaded
- `NEXT_PUBLIC_AWS_REGION`: The AWS region where your S3 bucket is located (e.g., `us-east-1`, `us-west-2`)
- `NEXT_PUBLIC_AWS_ACCESS_KEY_ID`: Your AWS access key ID with S3 write permissions
- `NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY`: Your AWS secret access key

**Note:** These variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser for client-side uploads.

## Styling

**Important**: This component does NOT define its own CSS variables. It expects your application to provide them. This ensures the component seamlessly integrates with your existing theme without conflicts.

The component uses the following CSS variables from your application's theme:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 252 12% 21%;
  --primary: 251 76% 57%;
  --border: 252 20% 93%;
  --muted-foreground: 252 12% 40%;
  --accent: 252 33% 97%;
  --destructive: 0 84.2% 60.2%;
  --radius: 0.75rem;
}

.dark {
  --background: 240 10% 4%;
  --foreground: 0 0% 98%;
  --border: 240 5% 15%;
  /* ... other dark mode variables */
}
```

## License

MIT
