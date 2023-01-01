import axios from 'axios';
import { ChangeEventHandler, FormEventHandler, useState } from 'react';

export default function HomePage() {
  const [attachment, setAttachment] = useState<File>();

  const onSubmit: FormEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();

    if (!attachment) {
      return;
    }

    const containerName = process.env.NEXT_PUBLIC_CONTAINER_NAME;

    if (!containerName) {
      throw new Error('Container name is not defined');
    }

    try {
      // Get Blob SAS URL which will be endpoint of uploading file
      const res = await axios.get('http://localhost:3000', {
        params: {
          containerName,
          fileName: attachment.name,
        },
      });
      const blobSasUrl = res.data.blobSas.sasUrl;
      const { status } = await axios.put(blobSasUrl, attachment, {
        headers: { 'x-ms-blob-type': 'BlockBlob' },
      });
      alert(JSON.stringify(status));
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const onChange: ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const file = ev.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  return (
    <main>
      <form onSubmit={onSubmit}>
        <input type="file" onChange={onChange} />
        <button type="submit" disabled={!attachment}>
          Submit
        </button>
        <button type="reset" onClick={() => setAttachment(undefined)}>
          Reset
        </button>
      </form>
    </main>
  );
}
