import React, { useRef, useEffect } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder = 'Enter text...', minHeight = '150px' }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);

  // Initialize Quill editor only once
  useEffect(() => {
    if (!containerRef.current || quillRef.current) return;

    const container = containerRef.current;
    const editorDiv = document.createElement('div');
    container.appendChild(editorDiv);

    quillRef.current = new Quill(editorDiv, {
      theme: 'snow',
      placeholder: placeholder,
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'header': [1, 2, 3, false] }],
          ['link'],
          ['clean']
        ]
      },
      formats: ['bold', 'italic', 'underline', 'list', 'header', 'link']
    });

    // Handle user typing
    quillRef.current.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user' && !isUpdatingRef.current) {
        const html = quillRef.current.root.innerHTML;
        onChange(html);
      }
    });

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
      if (container) {
        container.innerHTML = '';
      }
      quillRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AGGRESSIVELY update content whenever value prop changes
  useEffect(() => {
    if (!quillRef.current) return;

    const currentContent = quillRef.current.root.innerHTML;
    const incomingValue = value || '';

    console.log('🔍 RichTextEditor Update Check:', {
      placeholder,
      hasIncomingValue: !!incomingValue,
      incomingLength: incomingValue.length,
      incomingPreview: incomingValue.substring(0, 100),
      currentPreview: currentContent.substring(0, 100)
    });

    // Strip out Quill's empty paragraph to compare
    const cleanCurrent = currentContent.replace(/<p><br><\/p>/g, '').trim();
    const cleanIncoming = incomingValue.replace(/<p><br><\/p>/g, '').trim();

    // ALWAYS update if values don't match - be aggressive!
    if (cleanCurrent !== cleanIncoming) {
      console.log('✅ UPDATING QUILL - Values differ');
      isUpdatingRef.current = true;
      
      try {
        if (incomingValue) {
          // Use clipboard.convert to properly parse HTML
          const delta = quillRef.current.clipboard.convert(incomingValue);
          quillRef.current.setContents(delta, 'silent');
          console.log('✅ Content set via clipboard.convert');
        } else {
          // Clear editor if value is empty
          quillRef.current.setText('');
          console.log('✅ Editor cleared');
        }
      } catch (error) {
        console.error('❌ Quill update error:', error);
        // Fallback: just set the HTML directly
        try {
          quillRef.current.root.innerHTML = incomingValue;
          console.log('✅ Content set via innerHTML fallback');
        } catch (e) {
          console.error('❌ Fallback update failed:', e);
        }
      }
      
      isUpdatingRef.current = false;
    } else {
      console.log('⏭️ SKIPPING - Content already matches');
    }
  }, [value, placeholder]);

  return (
    <div className="quill-editor-wrapper">
      <div ref={containerRef} style={{ minHeight }} />
      <style>{`
        .quill-editor-wrapper .ql-container {
          min-height: ${minHeight};
          font-size: 16px;
          background-color: white;
        }
        .quill-editor-wrapper .ql-editor {
          min-height: ${minHeight};
          color: #000000 !important;
          background-color: white;
        }
        .quill-editor-wrapper .ql-editor p,
        .quill-editor-wrapper .ql-editor ol,
        .quill-editor-wrapper .ql-editor ul,
        .quill-editor-wrapper .ql-editor li {
          color: #000000 !important;
        }
        .quill-editor-wrapper .ql-editor.ql-blank::before {
          color: #9CA3AF !important;
          font-style: normal;
        }
        .quill-editor-wrapper .ql-snow .ql-stroke {
          stroke: #000000;
        }
        .quill-editor-wrapper .ql-snow .ql-fill {
          fill: #000000;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
