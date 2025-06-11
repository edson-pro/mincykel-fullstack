import React from "react";
import BikeForm from "@/components/BikeForm";
import axios from "axios";
import { GetServerSideProps } from "next";

export const getServerSideProps = (async (context) => {
  const { id } = context.params;
  // Fetch data from external API
  const { data } = await axios.get(
    process.env.NEXT_PUBLIC_API_URL + `/api/bikes/${id}`
  );

  const bike = await data?.data;
  // Pass data to the page via props
  return { props: { bike } };
}) satisfies GetServerSideProps<{ bike: any }>;

export default function Edit({ bike }: { bike: any }) {
  return <BikeForm bike={bike} />;
}
