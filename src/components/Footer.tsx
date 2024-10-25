import { FC } from "react";

const Footer: FC = () => {
  return (
    <footer className="text-center p-4 text-white mt-5">
      <p>
        © 2024-{new Date().getFullYear()} Video Trimmer build with 💜 by{" "}
        <a
          href="https://github.com/AbdurRaahimm"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-100 hover:text-pink-300 transition-colors duration-300 underline decoration-wavy"
        >  Abdur Rahim
        </a>
      </p>
    </footer>
  );
};

export default Footer;
