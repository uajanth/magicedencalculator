import { Fragment, useState, useEffect, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import MainContent from "../components/MainContent";
import FeeDetails from "../components/FeeDetails";
import "./App.css";
import NFTMain from "../components/NFTMain";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import Footer from "../components/Footer";
import Instructions from "../components/Instructions";

function App() {
	const [hasError, setHasError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState();
	const [salePrice, setSalePrice] = useState("");
	const [link, setLink] = useState("");
	const [details, setDetails] = useState({
		name: "",
		royaltyFee: "",
		imageLink: "",
		collectionName: "",
	});
	const [floorPrice, setFloorPrice] = useState();
	const [isSuccessful, setIsSuccessful] = useState(false);

	const fetchFloorPrice = useCallback(() => {
		const floorPriceDivisor = 1000000000;

		async function getFloorPrice() {
			const response = await fetch(
				`https://magicedencalculator-api.vercel.app/floor-price`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ collectionName: details.collectionName }),
				}
			);
			const data = await response.json();
			setFloorPrice(data.floorPrice / floorPriceDivisor);
		}
		getFloorPrice();
	}, [details.collectionName]);

	// Error Message, in case the API isn't responding or the mint address in the link is wrong
	useEffect(() => {
		if (details.royaltyFee === null) {
			setHasError(true);
			setErrorMessage("An Error Occured. Fix your link, or try again later.");
			setIsSuccessful(false);
		}
		if (details.collectionName !== "") {
			fetchFloorPrice();
		}
	}, [details, fetchFloorPrice]);

	const onLinkChange = (event) => {
		setLink(event.target.value);
	};

	const onSearch = (event) => {
		// Input validation to check on client side if url contains root link
		setIsSuccessful(false);
		setIsLoading(true);

		if (link.includes("https://magiceden.io/item-details/")) {
			if (link === "https://magiceden.io/item-details/") {
				setHasError(true);
				setErrorMessage(
					"Please enter a valid link! Make sure it starts with https://magiceden.io/item-details/"
				);
				setIsLoading(false);
				setIsSuccessful(false);
			} else {
				setHasError(false);
				setErrorMessage("");
				fetch("https://magicedencalculator-api.vercel.app/details", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ magicEdenLink: link }),
				})
					.then((response) => response.json())
					.then((nftDetails) => {
						setIsLoading(false);
						setDetails(Object.assign({}, nftDetails, { floorPrice: "" }));
					})
					.then(() => {
						setIsSuccessful(true);
					})
					.catch((error) =>
						console.log("An error has occurred with the initial request")
					);
			}
		} else {
			setHasError(true);
			setErrorMessage(
				"Please enter a valid link! Make sure it starts with https://magiceden.io/item-details/"
			);
			setIsLoading(false);
			setIsSuccessful(false);
		}
	};

	const getSalePrice = (value) => {
		setSalePrice(value);
	};

	return (
		<Fragment>
			<h1>Magic Eden Calculator</h1>
			{/* Disables the search button when isLoading is true to prevent additional requests */}
			<SearchBar
				onLinkChange={onLinkChange}
				onSearch={onSearch}
				disabled={isLoading}
			/>
			{hasError && <ErrorMessage errorMessage={errorMessage} />}
			{!isSuccessful && !isLoading && (
				<Instructions
					heading="Want to try it out?"
					message="Paste the following link into the search bar above to demo this web application."
					link="https://magiceden.io/item-details/CDysFDNCCevjbgg5RhmF6y7y6Qk7hnPYbzDrYwtYkhSJ"
				/>
			)}
			{isLoading && <LoadingSpinner />}
			{isSuccessful && !hasError && (
				<MainContent>
					<NFTMain
						imageLink={details.imageLink}
						name={details.name}
						salePrice={getSalePrice}
						floorPrice={floorPrice}
					/>
					<FeeDetails royaltyFee={details.royaltyFee} salePrice={salePrice} />
				</MainContent>
			)}
			<Footer />
		</Fragment>
	);
}

export default App;
