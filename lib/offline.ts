export function saveLocal(docId: number, content: any) {
  localStorage.setItem(`doc-${docId}`, JSON.stringify({
    content,
    updatedAt: Date.now()
  }));
}

export function loadLocal(docId: number) {
  const raw = localStorage.getItem(`doc-${docId}`);
  return raw ? JSON.parse(raw) : null;
}