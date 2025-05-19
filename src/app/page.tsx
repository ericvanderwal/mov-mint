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

  // Function to randomly select token based on rarity probabilities
  const getRandomToken = useCallback(() => {
    // Check if total minted has reached wallet limit
    if (totalMinted >= 5) {
      throw new Error("You've reached the maximum mint limit of 5 NFTs");
    }

    // Generate random number for probability check
    const random = Math.random() * 100;
    
    // 15% chance for Epic (Void)
    if (random < 15) return 2;
    
    // 35% chance for Rare (Boreal)
    if (random < 50) return 1;
    
    // 50% chance for Common (Sunset)
    return 0;
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
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showCountdown, setShowCountdown] = useState(true);

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date('2025-05-22T15:00:00-04:00'); // May 22nd, 2025, 3:00 PM EST

    const calculateTimeLeft = () => {
      const currentTime = new Date();
      const difference = targetDate.getTime() - currentTime.getTime();
      
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }
      
      setShowCountdown(false);
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const result = calculateTimeLeft();
    setTimeLeft(result);

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Track mints using direct balance checks
  useEffect(() => {
    if (!contract || !address) return;

    const updateBalances = async () => {
      try {
        // Get balances for all three token types
        const [token0, token1, token2] = await Promise.all([
          contract.erc1155.balanceOf(address, 0),
          contract.erc1155.balanceOf(address, 1),
          contract.erc1155.balanceOf(address, 2)
        ]);

        const balances = [
          Number(token0),
          Number(token1),
          Number(token2)
        ];

        const total = balances.reduce((a, b) => a + b, 0);
        setTokenBalances(balances);
        setTotalMinted(total);
        
        // Only log when wallet is connected
        if (address && connectionStatus === "connected") {
          console.log('Current balances:', balances);
          console.log('Total minted:', total);
        }
      } catch (err) {
        console.error("Error checking balances:", err);
      }
    };

    // Initial balance check
    updateBalances();

    // Set up interval to check balances periodically
    const interval = setInterval(updateBalances, 5000); // Check every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, [contract, address]);


  return (
    <>
      <div className="background-image" />
      <div className="background-overlay" />
      <header className="nav-header">
        <div className="nav-container">
          <div className="nav-logo">
            <Image
              src="/logo.png"
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
          <a href="https://testnet.somnia.network/" 
             target="_blank" 
             rel="noopener noreferrer" 
             className="notice-link">
            Go here to claim tokens from the faucet →
          </a>
        </div>
      </section>

      {showCountdown && (
        <div className="countdown card" style={{ padding: '0rem' }}>
          {/* Countdown Timer */}
          <section className="countdown-section" style={{ margin: '0rem' }}>
            <h3 className={`${orbitron.className} section-title`} style={{ fontSize: '24px', marginBottom: '0rem' }}>Mint Opens In</h3>
            <div className="countdown-timer" style={{ margin: '0rem' }}>
              <div className="countdown-item">
                <span className="countdown-value">{timeLeft.days}</span>
                <span className="countdown-label" style={{ margin: '0rem' }}>Days</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-value">{timeLeft.hours}</span>
                <span className="countdown-label" style={{ margin: '0rem' }}>Hours</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-value">{timeLeft.minutes}</span>
                <span className="countdown-label" style={{ margin: '0rem' }}>Minutes</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-value">{timeLeft.seconds}</span>
                <span className="countdown-label" style={{ margin: '0rem' }}>Seconds</span>
              </div>
            </div>
          </section>
        </div>
      )}

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

                    // Check total wallet limit before generating tokens
                    if (totalMinted + quantity > 5) {
                      const remaining = 5 - totalMinted;
                      if (remaining <= 0) {
                        throw new Error(`You've reached the maximum mint limit of 5 NFTs`);
                      } else {
                        throw new Error(`You can only mint ${remaining} more NFT${remaining === 1 ? '' : 's'}. You have minted ${totalMinted} so far.`);
                      }
                    }

                    // Generate token IDs for each NFT being minted
                    const tokenIds = Array.from({ length: quantity }, () => {
                      const random = Math.random() * 100;
                      // 15% chance for Epic (Void)
                      if (random < 15) return 2;
                      // 35% chance for Rare (Boreal)
                      if (random < 50) return 1;
                      // 50% chance for Common (Sunset)
                      return 0;
                    });

                    console.log('Minting token IDs:', tokenIds);

                    // Mint each token individually to maintain proper probabilities
                    const txPromises = tokenIds.map(tokenId =>
                      contract.erc1155.claim(tokenId, 1)
                    );

                    const txs = await Promise.all(txPromises);
                    // Show the last minted token's type in the success message
                    setMintedTokenId(tokenIds[tokenIds.length - 1]);
                    console.log("Successfully minted NFTs", txs);
                  } catch (err: any) {
                    console.error("Failed to mint NFT", err);
                    // Check for inactive claim condition
                    if (err.message?.includes("DropNoActiveCondition") || err.message?.includes("getActiveClaimConditionId")) {
                      setError("Minting has not started yet");
                    } else {
                      setError(err?.message || "Failed to mint NFT");
                    }
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
                    <DialogTitle>
                      {error.includes("maximum") ? "Minting Complete" : "Error"}
                    </DialogTitle>
                    <DialogDescription>
                      {error.includes("maximum") ? 
                        `Congratulations, you minted ${totalMinted} backgrounds!` : 
                        error
                      }
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

      {/* Minted Backgrounds Section */}
      {address && totalMinted > 0 && (
        <section className="minted-section">
          <h2 className={`${orbitron.className} section-title`} style={{ fontSize: '24px' }}>Your Collection</h2>
          <div className="minted-grid">
            {tokenBalances[0] > 0 && Array(tokenBalances[0]).fill(0).map((_, i) => (
              <div key={`sunset-${i}`} className="minted-item">
                <Image src="/sunset.png" alt="Sunset Background" width={200} height={100} className="minted-image" />
                <p className="minted-label">Common Sunset</p>
              </div>
            ))}
            {tokenBalances[1] > 0 && Array(tokenBalances[1]).fill(0).map((_, i) => (
              <div key={`boreal-${i}`} className="minted-item">
                <Image src="/boreal.png" alt="Boreal Background" width={200} height={100} className="minted-image" />
                <p className="minted-label">Rare Boreal</p>
              </div>
            ))}
            {tokenBalances[2] > 0 && Array(tokenBalances[2]).fill(0).map((_, i) => (
              <div key={`void-${i}`} className="minted-item">
                <Image src="/void.png" alt="Void Background" width={200} height={100} className="minted-image" />
                <p className="minted-label">Epic Void</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Game Description Section */}
      <section className="game-section">
        <div className="game-content">
          <h3 className={`${orbitron.className} section-title`} style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)' }}>Masks of the Void: Infinity</h3>
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
