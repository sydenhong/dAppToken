import React, { useState } from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits } from 'ethers';
import './App.css';
import { erc20Abi } from './config/abi.js';

const tokenAddress = '0x9566b3bC4faB5e57C2374d053289F1f63D6333Cf'; // Replace with your token address

function App() {
	const [walletAddress, setWalletAddress] = useState('');
	const [tokenBalance, setTokenBalance] = useState('');
	const [tokenSymbol, setTokenSymbol] = useState('');
	const [recipient, setRecipient] = useState('');
	const [amount, setAmount] = useState('');
	const [status, setStatus] = useState('');

	const connectWallet = async () => {
		if (window.ethereum) {
			try {
				const provider = new BrowserProvider(window.ethereum);
				const signer = await provider.getSigner();
				const address = await signer.getAddress();
				setWalletAddress(address);

				const tokenContract = new Contract(tokenAddress, erc20Abi, provider);
				const rawBalance = await tokenContract.balanceOf(address);
				const decimals = await tokenContract.decimals();
				const symbol = await tokenContract.symbol();

				const formatted = formatUnits(rawBalance, decimals);
				setTokenBalance(formatted);
				setTokenSymbol(symbol);
				setStatus('Wallet connected and token balance loaded.');
			} catch (err) {
				setStatus('Error: ' + err.message);
			}
		} else {
			alert('MetaMask not detected!');
		}
	};

	const sendToken = async () => {
		if (!recipient || !amount) return setStatus("Recipient and amount required.");

		try {
			const provider = new BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const tokenWithSigner = new Contract(tokenAddress, erc20Abi, signer);

			const decimals = await tokenWithSigner.decimals();
			const parsed = parseUnits(amount, decimals);
			const tx = await tokenWithSigner.transfer(recipient, parsed);
			setStatus("Transaction sent... waiting for confirmation.");
			await tx.wait();
			setStatus(`Transaction confirmed! Hash: ${tx.hash}`);

			const rawBalance = await tokenWithSigner.balanceOf(walletAddress);
			const formatted = formatUnits(rawBalance, decimals);
			setTokenBalance(formatted);
		} catch (err) {
			setStatus("Transaction failed: " + err.message);
		}
	};

	return (
		<div className="App">
			<h1>Connect Wallet & Send Token</h1>
			<button onClick={connectWallet}>Connect MetaMask</button>
			<p><strong>Wallet:</strong> {walletAddress || 'Not connected'}</p>
			<p><strong>Token Balance:</strong> {tokenBalance} {tokenSymbol}</p>

			<h3>Send Token</h3>
			<input type="text" placeholder="Recipient" value={recipient} onChange={e => setRecipient(e.target.value)} /><br /><br />
			<input type="text" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} /><br /><br />
			<button onClick={sendToken}>Send</button>
			<p style={{ color: 'green' }}>{status}</p>
		</div>
	);
}

export default App;
