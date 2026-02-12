import React from 'react';

const splitIntoDocuments = (documentsText) => {
  if (!documentsText || typeof documentsText !== 'string') return [];
  const normalized = documentsText
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '\n')
    .replace(/\u2022/g, ' ')
    .replace(/\*/g, ' ')
    .trim();

  const parts = normalized
    .split(/\n|\.|;|,/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const seen = new Set();
  const unique = [];
  for (const p of parts) {
    const key = p.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(p);
    }
  }
  return unique;
};

const mapToDocObjects = (items) => {
  return items.map((text) => {
    const lower = text.toLowerCase();
    const optional = lower.includes('optional') || lower.includes('if applicable');
    return {
      name: text,
      required: !optional
    };
  });
};

const Documents = ({ scheme }) => {
  const parsed = mapToDocObjects(splitIntoDocuments(scheme?.documents));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Required Documents</h3>
          
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <span className="text-gray-700 text-sm">Please ensure all documents are valid and clearly readable</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-gray-600 text-sm font-semibold py-3 pr-4">Document</th>
                    <th className="text-gray-600 text-sm font-semibold py-3">Required</th>
                  </tr>
                </thead>
                <tbody>
                  {(parsed.length > 0 ? parsed : [
                    { name: 'No documents information available for this scheme.', required: false }
                  ]).map((doc, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="font-medium text-gray-800 py-3 pr-4">{doc.name}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium border ${doc.required ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {doc.required ? 'Required' : 'Optional'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Documents;