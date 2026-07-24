import React from "react";

interface RentalAgreementContentProps {
  isLightTheme?: boolean;
}

export function RentalAgreementContent({ isLightTheme = false }: RentalAgreementContentProps) {
  // Styles based on theme
  const sectionTitleColor = "text-[#246596] font-bold text-xs mt-4 mb-2 flex items-center gap-2 border-b pb-1 dark:border-white/10 border-neutral-200 uppercase tracking-wide";
  const subsectionTitleColor = "text-neutral-900 dark:text-white font-bold text-[11px] mt-3 mb-1";
  const bodyText = isLightTheme ? "text-neutral-700 font-light text-xs leading-relaxed" : "text-white/80 font-light text-xs leading-relaxed";
  const emphasisText = "font-bold text-neutral-950 dark:text-white";
  const calloutBg = isLightTheme ? "bg-neutral-100 border border-neutral-200 p-3 rounded-xl my-2" : "bg-[#10324d]/25 border border-white/5 p-3 rounded-xl my-2";

  return (
    <div className="space-y-4">
      <div className="text-center pb-2 border-b dark:border-white/10 border-neutral-200">
        <h3 className={`text-sm font-black uppercase tracking-wide ${isLightTheme ? "text-neutral-900" : "text-white"}`}>
          GameBees PS5 Rental Agreement
        </h3>
        <p className={`text-[10px] mt-0.5 ${isLightTheme ? "text-neutral-500" : "text-white/55"}`}>
          Please read these terms carefully before renting.
        </p>
      </div>

      <p className={bodyText}>
        By renting a PlayStation 5 (&quot;PS5&quot;), controllers, games, or accessories from <span className={emphasisText}>GameBees</span>, you acknowledge that you have read, understood, and agree to the following terms and conditions.
      </p>

      {/* Section 1 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>1. General Terms</span>
        </h4>
        <ul className={`list-disc pl-5 space-y-1 ${bodyText}`}>
          <li>All PS5 consoles, controllers, games, cables, and accessories remain the sole property of <span className={emphasisText}>GameBees</span>.</li>
          <li>The customer is responsible for maintaining the equipment in good condition throughout the rental period.</li>
          <li>The equipment must be returned on or before the agreed return date and time.</li>
          <li>Rental charges will continue until all rented items are returned.</li>
        </ul>
      </div>

      {/* Section 2 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>2. Customer Responsibilities</span>
        </h4>
        <p className={`mb-1.5 ${bodyText}`}>The customer agrees to:</p>
        <ul className={`list-disc pl-5 space-y-1 ${bodyText}`}>
          <li>Handle all rented equipment with reasonable care.</li>
          <li>Use the equipment only for its intended purpose.</li>
          <li>Keep all accessories together.</li>
          <li>Return every item received in the same condition, excluding normal wear and tear.</li>
          <li>Not lend, transfer, or sub-rent the equipment to another person without written permission from GameBees.</li>
        </ul>
      </div>

      {/* Section 3 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>3. Damage Policy</span>
        </h4>
        <p className={bodyText}>
          We understand that accidents can happen. However, the customer is responsible for any damage, loss, or theft of rented equipment during the rental period.
        </p>

        <h5 className={subsectionTitleColor}>What Is Considered Damage?</h5>
        <p className={`mb-1 ${bodyText}`}>Damage includes, but is not limited to:</p>
        <ul className={`list-disc pl-5 space-y-1 ${bodyText}`}>
          <li>Cracked or broken console casing</li>
          <li>HDMI port damage</li>
          <li>Liquid damage</li>
          <li>Controller stick drift caused by misuse</li>
          <li>Broken buttons, triggers, or joysticks</li>
          <li>Damaged power, HDMI, or USB cables</li>
          <li>Physical damage to game discs</li>
          <li>Software or hardware tampering</li>
          <li>Any permanent loss of functionality</li>
        </ul>
        <p className={`mt-1.5 ${bodyText}`}>
          Normal cosmetic wear from regular use is not considered damage.
        </p>

        <h5 className={subsectionTitleColor}>Repairable Damage</h5>
        <p className={bodyText}>
          If the equipment can be repaired, the customer will be charged:
        </p>
        <div className={calloutBg}>
          <p className={`text-center font-black ${isLightTheme ? "text-[#246596]" : "text-[#5e9fd0]"}`}>
            Actual repair cost + ₹300
          </p>
          <p className={`text-[10px] text-center mt-0.5 ${isLightTheme ? "text-neutral-500" : "text-white/60"}`}>
            The additional ₹300 covers inspection, handling, and logistics costs.
          </p>
        </div>

        <h5 className={subsectionTitleColor}>Irreparable Damage</h5>
        <p className={bodyText}>
          If the equipment cannot be repaired, the customer must pay the <span className={emphasisText}>current market replacement value</span> of the damaged item.
        </p>

        <h5 className={subsectionTitleColor}>Loss or Theft</h5>
        <p className={bodyText}>
          If any rented item is lost, stolen, or cannot be returned, the customer must pay the <span className={emphasisText}>current market replacement value</span> of the missing item(s).
        </p>

        <h5 className={subsectionTitleColor}>Inspection & Damage Assessment</h5>
        <p className={`mb-1.5 ${bodyText}`}>Every rental is inspected before dispatch and again after return. If any damage or missing items are found:</p>
        <ul className={`list-disc pl-5 space-y-1 ${bodyText}`}>
          <li>GameBees will notify the customer.</li>
          <li>A detailed invoice will be issued.</li>
          <li>Payment must be completed within <span className={emphasisText}>24 hours</span> of receiving the invoice.</li>
        </ul>
      </div>

      {/* Section 4 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>4. Missing Items Policy</span>
        </h4>
        <p className={`mb-1.5 ${bodyText}`}>
          The customer is responsible for returning every item supplied with the rental, including but not limited to:
        </p>
        <ul className={`list-disc pl-5 space-y-1 ${bodyText}`}>
          <li>PS5 Console</li>
          <li>DualSense Controller(s)</li>
          <li>HDMI Cable</li>
          <li>Power Cable</li>
          <li>USB Charging Cable</li>
          <li>Game Disc(s) (if included)</li>
          <li>Carrying Case or Protective Bag (if provided)</li>
        </ul>

        <h5 className={subsectionTitleColor}>Package Security</h5>
        <p className={bodyText}>
          If the equipment is returned through a courier or third-party delivery service, the customer must ensure the package is securely packed and sealed before handing it over.
        </p>
        <p className={`mt-1 ${bodyText}`}>
          GameBees shall not be responsible for items lost during transit due to improper packaging. The customer will remain liable for any resulting loss or damage.
        </p>

        <h5 className={subsectionTitleColor}>Return of Missing Items</h5>
        <p className={bodyText}>
          If a missing item is later found, GameBees can arrange a pickup. The customer will be responsible for the pickup charges, equivalent to the original pickup cost incurred by GameBees. Rental charges may continue until the missing item has been successfully returned.
        </p>

        <h5 className={subsectionTitleColor}>Failure to Return Missing Items</h5>
        <p className={bodyText}>
          If an item is permanently lost or misplaced, payment for its replacement value must be made within <span className={emphasisText}>24 hours</span> after the payment request is issued.
        </p>
      </div>

      {/* Section 5 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>5. Late Returns</span>
        </h4>
        <ul className={`list-disc pl-5 space-y-1 ${bodyText}`}>
          <li>Rental charges continue until all rented equipment is returned.</li>
          <li>GameBees reserves the right to charge additional late fees for delayed returns.</li>
          <li>Repeated late returns may result in suspension or permanent refusal of future rental services.</li>
        </ul>
      </div>

      {/* Section 6 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>6. Prohibited Activities</span>
        </h4>
        <p className={`mb-1.5 ${bodyText}`}>The customer must not:</p>
        <ul className={`list-disc pl-5 space-y-1 ${bodyText}`}>
          <li>Open or disassemble the console or controllers.</li>
          <li>Attempt repairs.</li>
          <li>Install unauthorized software or jailbreak the console.</li>
          <li>Remove or alter serial number labels.</li>
          <li>Modify the hardware or accessories.</li>
          <li>Use the equipment for any unlawful purpose.</li>
        </ul>
        <p className={`mt-1.5 ${bodyText}`}>
          Any violation may result in immediate termination of the rental agreement and additional charges.
        </p>
      </div>

      {/* Section 7 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>7. Customer Liability</span>
        </h4>
        <p className={bodyText}>
          The customer assumes full responsibility for the rented equipment from the time it is delivered until it has been returned, inspected, and accepted by GameBees.
        </p>
      </div>

      {/* Section 8 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>8. Legal Action</span>
        </h4>
        <p className={bodyText}>
          Failure to comply with this agreement, refusal to pay outstanding charges, fraudulent activity, intentional damage, theft, or failure to return rented equipment may result in legal proceedings to recover losses and any associated legal costs.
        </p>
      </div>

      {/* Section 9 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>9. Governing Law</span>
        </h4>
        <p className={bodyText}>
          This agreement shall be governed by the laws of India. Any disputes arising out of this agreement shall be subject to the exclusive jurisdiction of the competent courts located in <span className={emphasisText}>Hyderabad, Telangana</span>.
        </p>
      </div>

      {/* Section 10 */}
      <div>
        <h4 className={sectionTitleColor}>
          <span>10. Acceptance of Terms</span>
        </h4>
        <p className={bodyText}>
          By placing an order, making payment, accepting delivery, or using any equipment rented from <span className={emphasisText}>GameBees</span>, the customer confirms that they have read, understood, and agreed to this Rental Agreement and all associated policies.
        </p>
      </div>
    </div>
  );
}
