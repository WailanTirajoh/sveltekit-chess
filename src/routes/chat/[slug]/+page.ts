export const ssr = true;

export const load = ({ params }) => {
	return {
		slug: params.slug
	};
};
