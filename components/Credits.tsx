import { Github, Linkedin, Website } from "./icons";

export default function Credits() {
  return (
    <>
      <section className="credits flex ">
        <a
          href="https://github.com/Mohamedattiadev"
          target="_blank"
          id="credits"
        >
          <Github />
        </a>
      </section>

      <section className="credits flex ">
        <a
          href="https://www.linkedin.com/in/mohmd-attia/"
          target="_blank"
          id="credits"
        >
          <Linkedin />
        </a>
      </section>

      <section className="credits flex ">
        <a href="#" target="_blank" id="credits">
          <Website />
        </a>
      </section>
    </>
  );
}
