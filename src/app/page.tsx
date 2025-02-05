"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Registrar os componentes necessários para o gráfico
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
interface Post {
  Unidade: string;
  Meta: string;
  Realizado: string | number;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

const Page = () => {
  const [chartDataCrescer, setChartDataCrescer] = useState<ChartData | null>(null);
  const [chartDataMais, setChartDataMais] = useState<ChartData | null>(null);

  // Função para preparar os dados do gráfico
  const prepareChartData = (posts: Post[]): ChartData => {
    const unidades = posts.map((post) => post.Unidade);

    const metas = posts.map((post) => parseFloat(post.Meta.replace("R$", "").replace(".", "").replace(",", ".")));

    const realizados = posts.map((post) => {
      let realizadoStr = typeof post.Realizado === 'string' ? post.Realizado : String(post.Realizado);
      realizadoStr = realizadoStr.replace("R$", "").replace(".", "").replace(",", ".");
      const realizadoNumber = parseFloat(realizadoStr);
      return isNaN(realizadoNumber) ? 0 : realizadoNumber; // Garantir que valores inválidos sejam convertidos para 0
    });

    return {
      labels: unidades,
      datasets: [
        {
          label: "Meta",
          data: metas,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Realizado",
          data: realizados,
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Hook para pegar os dados da API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://script.googleusercontent.com/macros/echo?user_content_key=tkPCnC_YXOFX-IaSAoz4f8C012gx1ck4DyFazeE2pBWlu_iEUUKAX8N2_8pEVQZsavOwsyICL76dczTv15sZ30gVD4KbgtU2m5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnJCSsHEc82faAX75HlSzVjUec-PVBX6OkeXoeeH6U9av_bNt-6mXa9Wn2UG2rlZ7Dgt5jrym9GghJ4xWIzJcYcPn-AG5LQkQ99z9Jw9Md8uu&lib=MK6NyOb3f-PeHa0mtkFPonUKwDD2Rz00K');
        const data = await response.json();
        
        const postsCrescer: Post[] = data.crescer || [];
        const postsMais: Post[] = data.mais || [];
        
        // Preparando os dados para os gráficos de "Crescer" e "Mais"
        const chartDataCrescerPrepared = prepareChartData(postsCrescer);
        const chartDataMaisPrepared = prepareChartData(postsMais);
        
        setChartDataCrescer(chartDataCrescerPrepared);
        setChartDataMais(chartDataMaisPrepared);
      } catch (error) {
        console.error("Erro ao buscar dados da API:", error);
      }
    };

    fetchData();
  }, []);

  // Renderizar os gráficos apenas quando os dados estiverem carregados
  if (!chartDataCrescer || !chartDataMais) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h2>Gráfico de Crescer</h2>
      <Bar data={chartDataCrescer} />

      <h2>Gráfico de Mais</h2>
      <Bar data={chartDataMais} />
    </div>
  );
};

export default Page;
