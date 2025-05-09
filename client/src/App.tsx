import React, { useEffect, useState } from 'react';

function App() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    const url = `${process.env.REACT_APP_API_URL}/servicos`; //engser-production.up.railway.app
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setDados(data);
        console.log('Dados recebidos:', data);
      })
      .catch((error) => {
        console.error('Erro na API:', error);
      });
  }, []);

  return (
    <div>
      <h1>Teste de Conexão com a API</h1>
      <pre>{JSON.stringify(dados, null, 2)}</pre>
    </div>
  );
}

export default App;
