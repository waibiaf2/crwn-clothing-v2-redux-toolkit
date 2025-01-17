import {useState} from "react";
import {CardElement, useElements, useStripe} from "@stripe/react-stripe-js";

import {BUTTON_TYPE_CLASSES} from "../button/button.component";
import {FormContainer, PaymentButton, PaymentFormContainer} from "./payment-form.styles";
import {useSelector} from "react-redux";
import {selectCartTotal} from "../../store/cart/cart.selector";
import {selectCurrentUser} from "../../store/user/user.selector";

const PaymentForm = () => {
	const stripe = useStripe();
	const elements = useElements();
	const amount = useSelector(selectCartTotal);
	const currentUser = useSelector(selectCurrentUser);
	const [isProcessingPayment, setIsProcessingPayment] = useState(false);
	
	const paymentHandler = async (e) => {
		e.preventDefault();
		
		if (!stripe || !elements) {
			return;
		}
		
		setIsProcessingPayment(true);
		const response = await fetch('/.netlify/functions/create-payment-intent', {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({amount: amount * 100 })
		}).then(res => res.json());
		
		// console.log(response);
		const {
			paymentIntent:{client_secret}
		} = response;
		
		const paymentResult = await stripe.confirmCardPayment(client_secret, {
			payment_method: {
				card: elements.getElement(CardElement),
				billing_details: {
					name: currentUser ? currentUser.displayName : "Guest",
				}
			}
		});
		
		setIsProcessingPayment(false);
		
		if (paymentResult.error) {
			alert(paymentResult.error);
		} else {
			if (paymentResult.paymentIntent.status === "succeeded") {
				alert("Payment successful");
			}
		}
	}
	
	return (
		<PaymentFormContainer >
			<h2>Credit Card Payments:</h2>
			<FormContainer onSubmit={paymentHandler}>
				<CardElement/>
				<PaymentButton  buttonType={BUTTON_TYPE_CLASSES.inverted} isLoading={isProcessingPayment}> Pay Now</PaymentButton>
			</FormContainer>
		</PaymentFormContainer>
	)
}

export default PaymentForm;
