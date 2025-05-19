"use client";

import Image from 'next/image';
import { Orbitron } from 'next/font/google';
import { useAddress, useContract, useDisconnect, useConnectionStatus, ConnectWallet, Web3Button } from "@thirdweb-dev/react";
import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@radix-ui/react-dialog';

const orbitron = Orbitron({ subsets: ['latin'] });

// Replace with your NFT contract address once deployed
const CONTRACT_ADDRESS = "0x8590d8cC8E37dF243ef158F5284a524D01E5F29d";

export default function Home() { 
  // Track individual token balances
  const [tokenBalances, setTokenBalances] = useState<number[]>([0, 0, 0]);

  // Function to randomly select token based on rarity and availability
  const getRandomToken = useCallback(() => {
    // Check which tokens are still available to mint
    const available = [
      tokenBalances[0] < 3, // Common: max 3
      tokenBalances[1] < 2, // Rare: max 2
      tokenBalances[2] < 1  // Epic: max 1
    ];

    // If no tokens are available, throw error
    if (!available.some(Boolean)) {
      throw new Error("You've reached the maximum mint limit for all available backgrounds");
    }

    // Adjust probabilities based on availability
    const random = Math.random() * 100;
    
    // Try to mint Epic (15% chance)
    if (random < 15 && available[2]) return 2;
    
    // Try to mint Rare (35% chance)
    if (random < 50 && available[1]) return 1;
    
    // Try to mint Common (50% chance)
    if (available[0]) return 0;
    
    // If preferred token is unavailable, fall back to any available token
    return available.findIndex(Boolean);
  }, [tokenBalances]);

  const address = useAddress();
  const disconnect = useDisconnect();
  const connectionStatus = useConnectionStatus();
  const [quantity, setQuantity] = useState(1);
  const { contract } = useContract(CONTRACT_ADDRESS);
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState("");
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [totalMinted, setTotalMinted] = useState(0);

  // Track mints for each token type
  useEffect(() => {
    const checkBalances = async () => {
      if (!contract || !address) return;
      try {
        const [token0, token1, token2] = await Promise.all([
          contract.erc1155.balanceOf(address, 0),
          contract.erc1155.balanceOf(address, 1),
          contract.erc1155.balanceOf(address, 2)
        ]);
        
        const balances = [Number(token0), Number(token1), Number(token2)];
        setTokenBalances(balances);
        const total = balances.reduce((a, b) => a + b, 0);
        setTotalMinted(total);

        // Check individual token limits
        const atLimit = [
          balances[0] >= 3, // Common limit
          balances[1] >= 2, // Rare limit
          balances[2] >= 1  // Epic limit
        ];

        if (atLimit.every(Boolean)) {
          setError("You've reached the maximum mint limit for all backgrounds");
        } else if (total >= 5) {
          setError("You've reached the total mint limit of 5 NFTs");
        }
      } catch (err) {
        console.error("Error checking balances:", err);
      }
    };
    checkBalances();
  }, [contract, address, isMinting]);


  return (
    <>
      <div className="background-image" />
      <div className="background-overlay" />
      <header className="nav-header">
        <div className="nav-container">
          <div className="nav-logo">
            <Image
              src="/T_Logo_MOV_Infinity_black (1).png"
              alt="MOV Logo"
              width={200}
              height={50}
              priority
            /> 
          </div> 
          <div className="nav-spacer"></div>
          <ConnectWallet 
            theme="dark"
            btnTitle="Connect Wallet"
            className="nav-button"
            modalTitle="Connect Your Wallet"
          />
        </div> 
      </header>
      <main className="container">
      {/* Hero Section */}
      <div className="hero"> 
        <h1 className={`${orbitron.className}`} data-text="Masks of the Void: Infinity">Masks of the Void: Infinity</h1>
        <h1 className={`${orbitron.className} collection`} data-text="Base Backgrounds">Base Backgrounds</h1>
      </div> 

      {/* STT Token Notice */}
      <section className="notice-section">
        <div className="notice-content">
          <h2 className={`${orbitron.className} notice-title`}>Important Notice</h2>
          <p className="notice-text">To mint on Somnia testnet, you'll need to grab some STT tokens to cover your gas.</p>
          <a href="https://x.com/MasksOfTheVoid/status/1923062705117638726" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="notice-link">
            Go here to claim tokens from the faucet →
          </a>
        </div>
      </section>

      {/* Main Card */}
      <div className="card">
        {/* Mint Button */}
        <div className="mint-section">
          <div className="mint-status">
            <h3 className={`${orbitron.className} text-xl mb-4`}>Base Backgrounds - Open Edition</h3>
            <p className="text-lg mb-6">The void isn't gonna decorate itself. Maximum 5 per wallet.</p>
          </div>
          {address ? (
            <div className="mint-controls">
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="quantity-btn"
                  disabled={isMinting}
                >
                  -
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity(Math.min(5 - totalMinted, quantity + 1))}
                  disabled={quantity >= 5 || isMinting}
                >
                  +
                </button>
              </div>
              <Web3Button
                contractAddress={CONTRACT_ADDRESS}
                action={async (contract) => {
                  try {
                    setIsMinting(true);
                    setError("");
                    // Check if this mint would exceed their total limit
                    if (totalMinted + quantity > 5) {
                      throw new Error(`You can only mint up to 5 NFTs in total. You have minted ${totalMinted} so far.`);
                    }

                    // Try to get a random token that's still available
                    const tokenId = getRandomToken();
                    
                    // Check if this mint would exceed the token's individual limit
                    const limits = [3, 2, 1]; // Common, Rare, Epic limits
                    if (tokenBalances[tokenId] + quantity > limits[tokenId]) {
                      throw new Error(`You can only mint up to ${limits[tokenId]} of this background type. You have ${tokenBalances[tokenId]}.`);
                    }

                    // Use Edition Drop claim method
                    const tx = await contract.erc1155.claim(
                      tokenId,
                      quantity
                    );
                    setMintedTokenId(tokenId);
                    console.log("Successfully minted NFT", tx);
                  } catch (err: any) {
                    console.error("Failed to mint NFT", err);
                    setError(err?.message || "Failed to mint NFT");
                    throw err; // This ensures the error shows in the Web3Button
                  } finally {
                    setIsMinting(false);
                  }
                }}
                className="mint-button"
                isDisabled={isMinting}
              >
                {isMinting ? "Minting..." : `Mint ${quantity} NFT${quantity > 1 ? 's' : ''} (Free)`}
              </Web3Button>
              {error && (
                <Dialog open={!!error} onOpenChange={() => setError("")}>  
                  <DialogContent>
                    <DialogTitle>Error</DialogTitle>
                    <DialogDescription>
                  {error}
                  {mintedTokenId !== null && (
                    <p className="mt-4">
                      Congratulations! You received the {' '}
                      {mintedTokenId === 2 ? 'Epic Void' :
                       mintedTokenId === 1 ? 'Rare Boreal' :
                       'Common Sunset'} Background!
                    </p>
                  )}
                </DialogDescription>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <ConnectWallet 
            theme="dark"
            btnTitle="Connect Wallet"
            className="nav-button"
            modalTitle="Connect Your Wallet"
          />          )}
        </div>
      </div>

      {/* Game Description Section */}
      <section className="game-section">
        <div className="game-content">
          <h3 className={`${orbitron.className} section-title`} style={{ fontSize: '2.5rem' }}>Masks of the Void: Infinity</h3>
          <p className="section-text">
          Masks of the Void: Infinity is a F2P wave-based roguelite showcasing fast-paced combat and competitive progression. 
          </p>
          <p className="section-text">
          Infinity introduces players to the Masks of the Void universe and offers a path to unlock exclusive rewards including access to the premium story-driven adventure game, Masks of the Void.
          </p>
        </div>
        <div className="game-media">
          <div className="yt-embed rounded-lg overflow-hidden shadow-[0_0_15px_rgba(180,155,87,0.3)] border border-[#B49B57] aspect-video">
            <iframe
              src="https://www.youtube.com/embed/DMrLW2gN--A"
              title="Masks of the Void Gameplay"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ aspectRatio: '16/9', width: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* Holder Perks Section */}
      <section className="perks-section">
        <div className="perks-content">
          <h2 className={`${orbitron.className} section-title`}>Base Backgrounds</h2>
          <ul className="section-text">
            <p>Masks of the Void: Infinity Base Backgrounds are cosmetic NFTs that allow players to customize their base. Each background has a unique design and rarity level with the Sunset background being Common, the Boreal background being Rare, and the Void background being Epic.</p>
            <div className="divider" style={{ height: '10px' }}></div>
            <p>Players can only mint a maximum of 5 Base Backgrounds per wallet.</p>
          </ul>
        </div>
        <div className="perks-media">
          <div className="rounded-lg overflow-hidden shadow-[0_0_15px_rgba(180,155,87,0.3)] border border-[#B49B57]">
            <Image src="/void.png" alt="Void Mask Artifact" width={400} height={200} className="object-cover" />
          </div>
          <div className="rounded-lg overflow-hidden shadow-[0_0_15px_rgba(180,155,87,0.3)] border border-[#B49B57]">
            <Image src="/sunset.png" alt="Void Mask Artifact" width={400} height={200} className="object-cover" />
          </div>
          <div className="rounded-lg overflow-hidden shadow-[0_0_15px_rgba(180,155,87,0.3)] border border-[#B49B57]">
            <Image src="/boreal.png" alt="Void Mask Artifact" width={400} height={200} className="object-cover" />
          </div>
        </div>
      </section>


    </main>
    </>
  )
}
